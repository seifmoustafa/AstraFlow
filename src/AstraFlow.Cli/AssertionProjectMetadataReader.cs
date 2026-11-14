using System.Text.Json;
using System.Xml;
using System.Xml.Linq;
using Microsoft.CodeAnalysis;

namespace AstraFlow.Cli;

internal sealed record AssertionProjectMetadata(
    IReadOnlyList<MetadataReference> References,
    string? TargetFramework,
    string? Limitation)
{
    public bool WasApplied => References.Count > 0;
}

/// <summary>Reads a narrow, non-evaluating subset of existing project metadata for assertion analysis.</summary>
internal static class AssertionProjectMetadataReader
{
    private const int MaximumCompileReferences = 512;
    private const long MaximumAssetsFileBytes = 32 * 1024 * 1024;

    public static AssertionProjectMetadata Read(string projectFile)
    {
        var projectPath = Path.GetFullPath(projectFile);
        if (!File.Exists(projectPath) || IsReparsePoint(projectPath))
        {
            return Missing("The selected project file is unavailable as a regular file; only host framework metadata was used.");
        }

        var targetFramework = ReadSingleLiteralTargetFramework(projectPath);
        if (targetFramework is null)
        {
            return Missing("Project properties are not evaluated. A single literal TargetFramework is required before restored package metadata can be used.");
        }

        var assetsPath = Path.Combine(Path.GetDirectoryName(projectPath)!, "obj", "project.assets.json");
        if (!File.Exists(assetsPath) || IsReparsePoint(assetsPath))
        {
            return Missing("No regular restored project.assets.json file was found; only host framework metadata was used.", targetFramework);
        }

        var assetsInfo = new FileInfo(assetsPath);
        if (assetsInfo.Length > MaximumAssetsFileBytes)
        {
            return Missing("The restored project metadata exceeded the analysis size limit; only host framework metadata was used.", targetFramework);
        }

        try
        {
            using var document = JsonDocument.Parse(File.ReadAllBytes(assetsPath));
            var root = document.RootElement;
            if (!root.TryGetProperty("targets", out var targets)
                || !targets.TryGetProperty(targetFramework, out var targetAssets)
                || !root.TryGetProperty("libraries", out var libraries)
                || !root.TryGetProperty("packageFolders", out var packageFolders))
            {
                return Missing("Restored package metadata does not contain the project's literal target framework; only host framework metadata was used.", targetFramework);
            }

            var references = new List<MetadataReference>();
            var referencePaths = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            string? limitation = null;

            foreach (var package in targetAssets.EnumerateObject())
            {
                if (!libraries.TryGetProperty(package.Name, out var library)
                    || !library.TryGetProperty("type", out var libraryType)
                    || !string.Equals(libraryType.GetString(), "package", StringComparison.OrdinalIgnoreCase)
                    || !library.TryGetProperty("path", out var packagePathElement)
                    || !package.Value.TryGetProperty("compile", out var compileAssets))
                {
                    continue;
                }

                var packageRelativePath = packagePathElement.GetString();
                if (string.IsNullOrWhiteSpace(packageRelativePath))
                {
                    continue;
                }

                foreach (var packageFolder in packageFolders.EnumerateObject())
                {
                    var packageRoot = Path.GetFullPath(packageFolder.Name);
                    if (!Directory.Exists(packageRoot) || IsReparsePoint(packageRoot))
                    {
                        continue;
                    }

                    foreach (var compileAsset in compileAssets.EnumerateObject())
                    {
                        var relativeAsset = compileAsset.Name;
                        if (relativeAsset.EndsWith("/_._", StringComparison.Ordinal)
                            || !relativeAsset.EndsWith(".dll", StringComparison.OrdinalIgnoreCase))
                        {
                            continue;
                        }

                        var candidatePath = Path.GetFullPath(Path.Combine(packageRoot, packageRelativePath, relativeAsset));
                        if (!IsWithinDirectory(packageRoot, candidatePath)
                            || !File.Exists(candidatePath)
                            || IsReparsePoint(candidatePath)
                            || !referencePaths.Add(candidatePath))
                        {
                            continue;
                        }

                        try
                        {
                            references.Add(MetadataReference.CreateFromFile(candidatePath));
                        }
                        catch (BadImageFormatException)
                        {
                            limitation ??= "One or more compile assets were not valid managed metadata and were skipped.";
                        }
                        catch (IOException)
                        {
                            limitation ??= "One or more compile assets could not be read and were skipped.";
                        }

                        if (references.Count >= MaximumCompileReferences)
                        {
                            limitation = "The compile reference limit was reached; analysis remains partial.";
                            break;
                        }
                    }

                    if (references.Count >= MaximumCompileReferences)
                    {
                        break;
                    }
                }
            }

            if (references.Count == 0)
            {
                return Missing("No package compile assets could be resolved safely from the restored metadata; only host framework metadata was used.", targetFramework);
            }

            return new AssertionProjectMetadata(references, targetFramework, limitation);
        }
        catch (JsonException)
        {
            return Missing("The restored project metadata could not be parsed; only host framework metadata was used.", targetFramework);
        }
        catch (IOException)
        {
            return Missing("The restored project metadata could not be read; only host framework metadata was used.", targetFramework);
        }
        catch (UnauthorizedAccessException)
        {
            return Missing("The restored project metadata was not accessible; only host framework metadata was used.", targetFramework);
        }
        catch (InvalidOperationException)
        {
            return Missing("The restored project metadata has an unsupported shape; only host framework metadata was used.", targetFramework);
        }
        catch (ArgumentException)
        {
            return Missing("The restored project metadata contains an invalid path; only host framework metadata was used.", targetFramework);
        }
        catch (NotSupportedException)
        {
            return Missing("The restored project metadata contains an unsupported path; only host framework metadata was used.", targetFramework);
        }
    }

    private static string? ReadSingleLiteralTargetFramework(string projectPath)
    {
        try
        {
            using var reader = XmlReader.Create(projectPath, new XmlReaderSettings
            {
                DtdProcessing = DtdProcessing.Prohibit,
                XmlResolver = null,
                IgnoreComments = true,
                IgnoreWhitespace = true
            });
            var project = XDocument.Load(reader);
            var targetFrameworks = project
                .Descendants()
                .Where(element => element.Name.LocalName is "TargetFramework" or "TargetFrameworks")
                .Select(element => element.Value.Trim())
                .Where(value => value.Length > 0)
                .ToArray();

            if (targetFrameworks.Length != 1)
            {
                return null;
            }

            var value = targetFrameworks[0];
            if (value.Contains("$(", StringComparison.Ordinal)
                || value.Contains(';')
                || value.Contains('$'))
            {
                return null;
            }

            return value;
        }
        catch (XmlException)
        {
            return null;
        }
        catch (IOException)
        {
            return null;
        }
        catch (UnauthorizedAccessException)
        {
            return null;
        }
        catch (InvalidOperationException)
        {
            return null;
        }
        catch (ArgumentException)
        {
            return null;
        }
    }

    private static AssertionProjectMetadata Missing(string message, string? targetFramework = null) =>
        new(Array.Empty<MetadataReference>(), targetFramework, message);

    private static bool IsWithinDirectory(string directory, string candidate)
    {
        var relative = Path.GetRelativePath(directory, candidate);
        return !Path.IsPathRooted(relative)
            && relative != ".."
            && !relative.StartsWith(".." + Path.DirectorySeparatorChar, StringComparison.Ordinal)
            && !relative.StartsWith(".." + Path.AltDirectorySeparatorChar, StringComparison.Ordinal);
    }

    private static bool IsReparsePoint(string path) =>
        (File.GetAttributes(path) & FileAttributes.ReparsePoint) != 0;
}
