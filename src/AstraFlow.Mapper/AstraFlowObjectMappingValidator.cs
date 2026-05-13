namespace AstraFlow.Mapper;

/// <summary>
/// Default validator for AstraFlow explicit object mapping rules.
/// It verifies that module rules declare their owned pairs and that no pair is owned by more than one rule.
/// </summary>
public sealed class AstraFlowObjectMappingValidator : IObjectMappingValidator
{
    private readonly IReadOnlyList<IObjectMappingRule> _rules;

    /// <summary>
    /// Creates a validator over the registered mapping rules.
    /// </summary>
    /// <param name="rules">Mapping rules discovered from active modules.</param>
    public AstraFlowObjectMappingValidator(IEnumerable<IObjectMappingRule> rules)
    {
        _rules = rules.ToArray();
    }

    /// <inheritdoc />
    public void Validate(MappingOptions options)
    {
        if (options is null)
            throw new ArgumentNullException(nameof(options));

        var declaredRules = _rules
            .OfType<IDeclaredObjectMappingRule>()
            .ToArray();

        if (options.RequireDeclaredMappingRules)
        {
            var undeclaredRule = _rules
                .FirstOrDefault(rule => rule is not IDeclaredObjectMappingRule);

            if (undeclaredRule is not null)
            {
                throw new InvalidOperationException(
                    $"Mapping rule '{undeclaredRule.GetType().FullName}' must implement '{nameof(IDeclaredObjectMappingRule)}'.");
            }
        }

        foreach (var rule in declaredRules)
        {
            if (rule.DeclaredMappings.Count == 0)
            {
                throw new InvalidOperationException(
                    $"Mapping rule '{rule.GetType().FullName}' declares no mappings.");
            }
        }

        var declarations = declaredRules
            .SelectMany(rule => rule.DeclaredMappings.Select(pair => new MappingDeclaration(rule, pair)))
            .ToArray();

        var duplicateDeclaration = declarations
            .GroupBy(declaration => declaration.Pair)
            .FirstOrDefault(group => group.Skip(1).Any());

        if (duplicateDeclaration is not null)
        {
            var owners = string.Join(", ", duplicateDeclaration.Select(d => d.Rule.GetType().FullName).Distinct());
            throw new InvalidOperationException(
                $"Mapping pair '{duplicateDeclaration.Key}' is declared by multiple rules: {owners}.");
        }

        foreach (var declaration in declarations)
        {
            var owners = _rules
                .Where(rule => rule.CanMap(declaration.Pair.SourceType, declaration.Pair.DestinationType))
                .ToArray();

            if (owners.Length == 0)
            {
                throw new InvalidOperationException(
                    $"Mapping pair '{declaration.Pair}' is declared but no rule accepts it.");
            }

            if (owners.Length > 1)
            {
                var ownerNames = string.Join(", ", owners.Select(owner => owner.GetType().FullName));
                throw new InvalidOperationException(
                    $"Mapping pair '{declaration.Pair}' is accepted by multiple rules: {ownerNames}.");
            }

            if (!ReferenceEquals(owners[0], declaration.Rule))
            {
                throw new InvalidOperationException(
                    $"Mapping pair '{declaration.Pair}' is declared by '{declaration.Rule.GetType().FullName}' but accepted by '{owners[0].GetType().FullName}'.");
            }
        }
    }

    private sealed record MappingDeclaration(IDeclaredObjectMappingRule Rule, ObjectMappingPair Pair);
}
