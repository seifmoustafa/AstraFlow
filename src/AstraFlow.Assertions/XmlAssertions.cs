using System.Xml;
using System.Xml.Linq;

namespace AstraFlow.Assertions;

internal static class XmlStructuralComparer
{
    public static bool AreEquivalent(XNode? left, XNode? right)
    {
        if (ReferenceEquals(left, right))
        {
            return true;
        }

        if (left is null || right is null)
        {
            return false;
        }

        if (left is XElement leftElement && right is XElement rightElement)
        {
            return ElementsAreEquivalent(leftElement, rightElement);
        }

        if (left is XDocument leftDocument && right is XDocument rightDocument)
        {
            return NodeSequencesAreEquivalent(leftDocument.Nodes(), rightDocument.Nodes());
        }

        if (left is XText leftText && right is XText rightText)
        {
            return string.Equals(leftText.Value, rightText.Value, StringComparison.Ordinal);
        }

        if (left is XComment leftComment && right is XComment rightComment)
        {
            return string.Equals(leftComment.Value, rightComment.Value, StringComparison.Ordinal);
        }

        if (left is XProcessingInstruction leftInstruction && right is XProcessingInstruction rightInstruction)
        {
            return string.Equals(leftInstruction.Target, rightInstruction.Target, StringComparison.Ordinal)
                && string.Equals(leftInstruction.Data, rightInstruction.Data, StringComparison.Ordinal);
        }

        if (left is XDocumentType leftType && right is XDocumentType rightType)
        {
            return string.Equals(leftType.Name, rightType.Name, StringComparison.Ordinal)
                && string.Equals(leftType.PublicId, rightType.PublicId, StringComparison.Ordinal)
                && string.Equals(leftType.SystemId, rightType.SystemId, StringComparison.Ordinal)
                && string.Equals(leftType.InternalSubset, rightType.InternalSubset, StringComparison.Ordinal);
        }

        return false;
    }

    private static bool ElementsAreEquivalent(XElement left, XElement right)
    {
        if (left.Name != right.Name)
        {
            return false;
        }

        var leftAttributes = left.Attributes().Where(attribute => !attribute.IsNamespaceDeclaration).ToArray();
        var rightAttributes = right.Attributes().Where(attribute => !attribute.IsNamespaceDeclaration).ToArray();
        if (leftAttributes.Length != rightAttributes.Length)
        {
            return false;
        }

        foreach (var expected in rightAttributes)
        {
            var actual = leftAttributes.FirstOrDefault(attribute => attribute.Name == expected.Name);
            if (actual is null || !string.Equals(actual.Value, expected.Value, StringComparison.Ordinal))
            {
                return false;
            }
        }

        return NodeSequencesAreEquivalent(left.Nodes(), right.Nodes());
    }

    private static bool NodeSequencesAreEquivalent(IEnumerable<XNode> left, IEnumerable<XNode> right)
    {
        using var leftEnumerator = left.GetEnumerator();
        using var rightEnumerator = right.GetEnumerator();

        while (true)
        {
            var hasLeft = leftEnumerator.MoveNext();
            var hasRight = rightEnumerator.MoveNext();
            if (hasLeft != hasRight)
            {
                return false;
            }

            if (!hasLeft)
            {
                return true;
            }

            if (!AreEquivalent(leftEnumerator.Current, rightEnumerator.Current))
            {
                return false;
            }
        }
    }
}

/// <summary>Creates assertion objects for XML documents and elements.</summary>
public static class XmlAssertionExtensions
{
    /// <summary>Creates assertions for an XML document.</summary>
    public static XDocumentAssertions Should(this XDocument? subject) => new(subject);

    /// <summary>Creates assertions for an XML element.</summary>
    public static XElementAssertions Should(this XElement? subject) => new(subject);

    /// <summary>Creates non-consuming assertions for the current state of an XML reader.</summary>
    public static XmlReaderAssertions Should(this XmlReader? subject) => new(subject);
}

/// <summary>Checks the current cursor state of an XML reader without advancing or disposing it.</summary>
public sealed class XmlReaderAssertions
{
    internal XmlReaderAssertions(XmlReader? subject) => Subject = subject;

    /// <summary>Gets the reader being asserted.</summary>
    public XmlReader? Subject { get; }

    /// <summary>Returns this assertion object for another related check.</summary>
    public XmlReaderAssertions And => this;

    /// <summary>Asserts the reader's current read state.</summary>
    public XmlReaderAssertions HaveReadState(ReadState expected)
    {
        ValidateEnumValue(expected, nameof(expected));
        if (RequireSubject().ReadState != expected)
        {
            AssertionFailure.Fail("Expected the XML reader to have the requested read state.");
        }

        return this;
    }

    /// <summary>Asserts the reader's current node type.</summary>
    public XmlReaderAssertions HaveNodeType(XmlNodeType expected)
    {
        ValidateEnumValue(expected, nameof(expected));
        if (RequireSubject().NodeType != expected)
        {
            AssertionFailure.Fail("Expected the XML reader to have the requested node type.");
        }

        return this;
    }

    /// <summary>Asserts the reader's current node depth.</summary>
    public XmlReaderAssertions HaveDepth(int expected)
    {
        if (expected < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(expected), "XML reader depth cannot be negative.");
        }
        if (RequireSubject().Depth != expected)
        {
            AssertionFailure.Fail("Expected the XML reader to have the requested node depth.");
        }

        return this;
    }

    /// <summary>Asserts the local name and namespace of the current element, end element, or attribute.</summary>
    public XmlReaderAssertions HaveName(XName expectedName)
    {
        if (expectedName is null)
        {
            throw new ArgumentNullException(nameof(expectedName));
        }

        var reader = RequireSubject();
        if (reader.NodeType is not (XmlNodeType.Element or XmlNodeType.EndElement or XmlNodeType.Attribute))
        {
            AssertionFailure.Fail("Expected the XML reader to be positioned on a named node.");
        }

        if (!string.Equals(reader.LocalName, expectedName.LocalName, StringComparison.Ordinal)
            || !string.Equals(reader.NamespaceURI, expectedName.NamespaceName, StringComparison.Ordinal))
        {
            AssertionFailure.Fail("Expected the XML reader to have the requested expanded name.");
        }

        return this;
    }

    private XmlReader RequireSubject()
    {
        if (Subject is null)
        {
            AssertionFailure.Fail("Expected an XML reader, but the subject was null.");
        }

        return Subject;
    }

    private static void ValidateEnumValue<TEnum>(TEnum value, string parameterName)
        where TEnum : struct, Enum
    {
        if (!Enum.IsDefined(typeof(TEnum), value))
        {
            throw new ArgumentOutOfRangeException(parameterName, "The value is not a defined XML reader state.");
        }
    }
}

/// <summary>Assertions for an XML document's root and direct root elements.</summary>
public sealed class XDocumentAssertions
{
    internal XDocumentAssertions(XDocument? subject) => Subject = subject;

    /// <summary>Gets the XML document being asserted.</summary>
    public XDocument? Subject { get; }

    /// <summary>Returns this assertion object for a related check.</summary>
    public XDocumentAssertions And => this;

    /// <summary>Asserts that the document has a root element with the supplied unqualified name.</summary>
    public XElementAssertions HaveRoot(string expectedName)
    {
        ValidateName(expectedName, nameof(expectedName));
        return HaveRoot(XNamespace.None + expectedName);
    }

    /// <summary>Asserts that the document has a root element with the supplied qualified name.</summary>
    public XElementAssertions HaveRoot(XName expectedName)
    {
        ValidateName(expectedName, nameof(expectedName));
        var document = RequireSubject();
        var root = document.Root;
        if (root is null || root.Name != expectedName)
        {
            AssertionFailure.Fail($"Expected XML document to have root element '{expectedName}'.");
        }

        return new XElementAssertions(root);
    }

    /// <summary>Asserts that the document does not have a root element with the supplied unqualified name.</summary>
    public XDocumentAssertions NotHaveRoot(string unexpectedName)
    {
        ValidateName(unexpectedName, nameof(unexpectedName));
        return NotHaveRoot(XNamespace.None + unexpectedName);
    }

    /// <summary>Asserts that the document does not have a root element with the supplied qualified name.</summary>
    public XDocumentAssertions NotHaveRoot(XName unexpectedName)
    {
        ValidateName(unexpectedName, nameof(unexpectedName));
        var root = RequireSubject().Root;
        if (root is not null && root.Name == unexpectedName)
        {
            AssertionFailure.Fail($"Expected XML document not to have root element '{unexpectedName}'.");
        }

        return this;
    }

    /// <summary>Asserts that the root element has a direct child with the supplied unqualified name.</summary>
    public XElementAssertions HaveElement(string expectedName)
    {
        ValidateName(expectedName, nameof(expectedName));
        return HaveElement(XNamespace.None + expectedName);
    }

    /// <summary>Asserts that the root element has a direct child with the supplied qualified name.</summary>
    public XElementAssertions HaveElement(XName expectedName)
    {
        ValidateName(expectedName, nameof(expectedName));
        var root = RequireSubject().Root;
        var child = root?.Element(expectedName);
        if (child is null)
        {
            AssertionFailure.Fail($"Expected XML document root to have direct child element '{expectedName}'.");
        }

        return new XElementAssertions(child);
    }

    /// <summary>Asserts that the root element has no direct child with the supplied unqualified name.</summary>
    public XDocumentAssertions NotHaveElement(string unexpectedName)
    {
        ValidateName(unexpectedName, nameof(unexpectedName));
        return NotHaveElement(XNamespace.None + unexpectedName);
    }

    /// <summary>Asserts that the root element has no direct child with the supplied qualified name.</summary>
    public XDocumentAssertions NotHaveElement(XName unexpectedName)
    {
        ValidateName(unexpectedName, nameof(unexpectedName));
        var root = RequireSubject().Root;
        if (root?.Element(unexpectedName) is not null)
        {
            AssertionFailure.Fail($"Expected XML document root not to have direct child element '{unexpectedName}'.");
        }

        return this;
    }

    /// <summary>Asserts that this document is structurally equivalent to the expected document.</summary>
    /// <remarks>Uses LINQ to XML deep equality. XML declarations are ignored, while child-node order and node values are compared.</remarks>
    public XDocumentAssertions BeEquivalentTo(XDocument? expected)
    {
        if (!AreEquivalent(Subject, expected))
        {
            AssertionFailure.Fail("Expected XML document to be structurally equivalent to the expected document, but it differed.");
        }

        return this;
    }

    /// <summary>Asserts that this document is not structurally equivalent to the unexpected document.</summary>
    /// <remarks>Uses LINQ to XML deep equality. XML declarations are ignored, while child-node order and node values are compared.</remarks>
    public XDocumentAssertions NotBeEquivalentTo(XDocument? unexpected)
    {
        if (AreEquivalent(Subject, unexpected))
        {
            AssertionFailure.Fail("Expected XML document not to be structurally equivalent to the unexpected document, but it was.");
        }

        return this;
    }

    private static bool AreEquivalent(XDocument? subject, XDocument? expected)
    {
        if (subject is null || expected is null)
        {
            return subject is null && expected is null;
        }

        return XmlStructuralComparer.AreEquivalent(subject, expected);
    }

    private XDocument RequireSubject() => Subject ?? throw new AstraFlowAssertionException("Expected an XML document, but the subject was null.");

    private static void ValidateName(string? name, string parameterName)
    {
        if (string.IsNullOrEmpty(name))
        {
            throw new ArgumentException("An XML name cannot be null or empty.", parameterName);
        }
    }

    private static void ValidateName(XName? name, string parameterName)
    {
        if (name is null)
        {
            throw new ArgumentNullException(parameterName);
        }
    }
}

/// <summary>Assertions for an XML element's direct children, attributes, and text value.</summary>
public sealed class XElementAssertions
{
    internal XElementAssertions(XElement? subject) => Subject = subject;

    /// <summary>Gets the XML element being asserted.</summary>
    public XElement? Subject { get; }

    /// <summary>Returns this assertion object for a related check.</summary>
    public XElementAssertions And => this;

    /// <summary>Asserts that the element has a direct child with the supplied unqualified name.</summary>
    public XElementAssertions HaveElement(string expectedName)
    {
        ValidateName(expectedName, nameof(expectedName));
        return HaveElement(XNamespace.None + expectedName);
    }

    /// <summary>Asserts that the element has a direct child with the supplied qualified name.</summary>
    public XElementAssertions HaveElement(XName expectedName)
    {
        ValidateName(expectedName, nameof(expectedName));
        var child = RequireSubject().Element(expectedName);
        if (child is null)
        {
            AssertionFailure.Fail($"Expected XML element to have direct child element '{expectedName}'.");
        }

        return new XElementAssertions(child);
    }

    /// <summary>Asserts that the element has no direct child with the supplied unqualified name.</summary>
    public XElementAssertions NotHaveElement(string unexpectedName)
    {
        ValidateName(unexpectedName, nameof(unexpectedName));
        return NotHaveElement(XNamespace.None + unexpectedName);
    }

    /// <summary>Asserts that the element has no direct child with the supplied qualified name.</summary>
    public XElementAssertions NotHaveElement(XName unexpectedName)
    {
        ValidateName(unexpectedName, nameof(unexpectedName));
        if (RequireSubject().Element(unexpectedName) is not null)
        {
            AssertionFailure.Fail($"Expected XML element not to have direct child element '{unexpectedName}'.");
        }

        return this;
    }

    /// <summary>Asserts that the element has an attribute with the supplied unqualified name.</summary>
    public XElementAssertions HaveAttribute(string expectedName)
    {
        ValidateName(expectedName, nameof(expectedName));
        return HaveAttribute(XNamespace.None + expectedName);
    }

    /// <summary>Asserts that the element has an attribute with the supplied qualified name.</summary>
    public XElementAssertions HaveAttribute(XName expectedName)
    {
        ValidateName(expectedName, nameof(expectedName));
        if (RequireSubject().Attribute(expectedName) is null)
        {
            AssertionFailure.Fail($"Expected XML element to have attribute '{expectedName}'.");
        }

        return this;
    }

    /// <summary>Asserts that the element has no attribute with the supplied unqualified name.</summary>
    public XElementAssertions NotHaveAttribute(string unexpectedName)
    {
        ValidateName(unexpectedName, nameof(unexpectedName));
        return NotHaveAttribute(XNamespace.None + unexpectedName);
    }

    /// <summary>Asserts that the element has no attribute with the supplied qualified name.</summary>
    public XElementAssertions NotHaveAttribute(XName unexpectedName)
    {
        ValidateName(unexpectedName, nameof(unexpectedName));
        if (RequireSubject().Attribute(unexpectedName) is not null)
        {
            AssertionFailure.Fail($"Expected XML element not to have attribute '{unexpectedName}'.");
        }

        return this;
    }

    /// <summary>Asserts that the element has the named attribute with the expected value.</summary>
    public XElementAssertions HaveAttributeWithValue(string expectedName, string expectedValue)
    {
        ValidateName(expectedName, nameof(expectedName));
        if (expectedValue is null)
        {
            throw new ArgumentNullException(nameof(expectedValue));
        }

        return HaveAttributeWithValue(XNamespace.None + expectedName, expectedValue);
    }

    /// <summary>Asserts that the element has the named attribute with the expected value.</summary>
    public XElementAssertions HaveAttributeWithValue(XName expectedName, string expectedValue)
    {
        ValidateName(expectedName, nameof(expectedName));
        if (expectedValue is null)
        {
            throw new ArgumentNullException(nameof(expectedValue));
        }

        var attribute = RequireSubject().Attribute(expectedName);
        if (attribute is null || !string.Equals(attribute.Value, expectedValue, StringComparison.Ordinal))
        {
            AssertionFailure.Fail($"Expected XML attribute '{expectedName}' to have the specified value.");
        }

        return this;
    }

    /// <summary>Asserts that the element's text value equals the expected value using ordinal comparison.</summary>
    public XElementAssertions HaveValue(string expectedValue)
    {
        if (expectedValue is null)
        {
            throw new ArgumentNullException(nameof(expectedValue));
        }

        if (!string.Equals(RequireSubject().Value, expectedValue, StringComparison.Ordinal))
        {
            AssertionFailure.Fail("Expected XML element to have the specified text value.");
        }

        return this;
    }

    /// <summary>Asserts that this element is structurally equivalent to the expected element.</summary>
    /// <remarks>Uses LINQ to XML deep equality; child-node order and node values are compared.</remarks>
    public XElementAssertions BeEquivalentTo(XElement? expected)
    {
        if (!AreEquivalent(Subject, expected))
        {
            AssertionFailure.Fail("Expected XML element to be structurally equivalent to the expected element, but it differed.");
        }

        return this;
    }

    /// <summary>Asserts that this element is not structurally equivalent to the unexpected element.</summary>
    /// <remarks>Uses LINQ to XML deep equality; child-node order and node values are compared.</remarks>
    public XElementAssertions NotBeEquivalentTo(XElement? unexpected)
    {
        if (AreEquivalent(Subject, unexpected))
        {
            AssertionFailure.Fail("Expected XML element not to be structurally equivalent to the unexpected element, but it was.");
        }

        return this;
    }

    private static bool AreEquivalent(XElement? subject, XElement? expected)
    {
        if (subject is null || expected is null)
        {
            return subject is null && expected is null;
        }

        return XmlStructuralComparer.AreEquivalent(subject, expected);
    }

    private XElement RequireSubject() => Subject ?? throw new AstraFlowAssertionException("Expected an XML element, but the subject was null.");

    private static void ValidateName(string? name, string parameterName)
    {
        if (string.IsNullOrEmpty(name))
        {
            throw new ArgumentException("An XML name cannot be null or empty.", parameterName);
        }
    }

    private static void ValidateName(XName? name, string parameterName)
    {
        if (name is null)
        {
            throw new ArgumentNullException(parameterName);
        }
    }
}
