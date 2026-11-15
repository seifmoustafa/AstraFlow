using System;
using System.Xml.Linq;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class XmlAssertionTests
{
    [Fact]
    public void DocumentAndElementAssertions_SelectRootsAndDirectChildren()
    {
        var document = XDocument.Parse("<root status='ready'><item id='42'><name>Ada</name></item></root>");

        document.Should()
            .HaveRoot("root")
            .HaveAttributeWithValue("status", "ready")
            .HaveElement("item")
            .HaveAttributeWithValue("id", "42")
            .HaveElement("name")
            .HaveValue("Ada");

        document.Should().NotHaveRoot("other").NotHaveElement("missing");
        document.Root!.Should().NotHaveElement("missing").NotHaveAttribute("missing");
    }

    [Fact]
    public void XmlAssertions_RespectQualifiedNames()
    {
        XNamespace ns = "urn:orders";
        var document = new XDocument(new XElement(ns + "order", new XElement(ns + "line", new XAttribute("id", "1"))));

        document.Should()
            .HaveRoot(ns + "order")
            .HaveElement(ns + "line")
            .HaveAttribute(XName.Get("id"));

        Assert.Throws<AstraFlowAssertionException>(() => document.Should().HaveRoot("order"));
    }

    [Fact]
    public void XmlAssertions_FailureMessagesNeverRenderElementOrAttributeValues()
    {
        var element = XElement.Parse("<account token='private-attribute'>private-text</account>");

        var attributeFailure = Assert.Throws<AstraFlowAssertionException>(
            () => element.Should().HaveAttributeWithValue("token", "expected-private-value"));
        var textFailure = Assert.Throws<AstraFlowAssertionException>(
            () => element.Should().HaveValue("expected-private-text"));

        Assert.DoesNotContain("private-attribute", attributeFailure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("expected-private-value", attributeFailure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("private-text", textFailure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("expected-private-text", textFailure.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void XmlAssertions_NullSubjectsFailAndInvalidNamesAreRejected()
    {
        XDocument? document = null;
        XElement? element = null;

        Assert.Throws<AstraFlowAssertionException>(() => document.Should().HaveRoot("root"));
        Assert.Throws<AstraFlowAssertionException>(() => element.Should().HaveValue("value"));
        Assert.Throws<ArgumentException>(() => XDocument.Parse("<root />").Should().HaveRoot(string.Empty));
        Assert.Throws<ArgumentException>(() => XElement.Parse("<root />").Should().HaveElement(string.Empty));
        Assert.Throws<ArgumentNullException>(() => XElement.Parse("<root />").Should().HaveAttributeWithValue("id", null!));
    }

    [Fact]
    public void XmlDocumentEquivalency_IsStructuralAndIgnoresNamespacePrefixes()
    {
        var subject = new XDocument(
            new XDeclaration("1.0", "utf-8", "yes"),
            XElement.Parse("<root xmlns='urn:orders'><item id='1'>safe</item></root>"));
        var expected = new XDocument(
            new XDeclaration("1.1", "utf-16", "no"),
            XElement.Parse("<o:root xmlns:o='urn:orders'><o:item id='1'>safe</o:item></o:root>"));

        subject.Should().BeEquivalentTo(expected).NotBeEquivalentTo(XDocument.Parse("<root />"));
    }

    [Fact]
    public void XmlElementEquivalency_ComparesContentAndPreservesChildOrder()
    {
        var subject = XElement.Parse("<root><first>one</first><second>two</second></root>");
        var same = XElement.Parse("<root><first>one</first><second>two</second></root>");
        var reordered = XElement.Parse("<root><second>two</second><first>one</first></root>");

        subject.Should().BeEquivalentTo(same).NotBeEquivalentTo(reordered);

        var attributeOrderAndCData = XElement.Parse("<root first='1' second='2'><child><![CDATA[text]]></child></root>");
        var attributeOrderAndText = XElement.Parse("<root second='2' first='1'><child>text</child></root>");
        attributeOrderAndCData.Should().BeEquivalentTo(attributeOrderAndText);
    }

    [Fact]
    public void XmlEquivalency_FailureMessagesOmitDocumentAndElementValues()
    {
        var document = XDocument.Parse("<account token='private-attribute'>private-document-text</account>");
        var element = XElement.Parse("<account token='private-attribute'>private-element-text</account>");

        var documentFailure = Assert.Throws<AstraFlowAssertionException>(() =>
            document.Should().BeEquivalentTo(XDocument.Parse("<account>expected-private-document-text</account>")));
        var elementFailure = Assert.Throws<AstraFlowAssertionException>(() =>
            element.Should().NotBeEquivalentTo(XElement.Parse("<account token='private-attribute'>private-element-text</account>")));

        Assert.DoesNotContain("private-attribute", documentFailure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("private-document-text", documentFailure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("expected-private-document-text", documentFailure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("private-attribute", elementFailure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("private-element-text", elementFailure.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void XmlEquivalency_HandlesNullPairsAndNullSubjects()
    {
        XDocument? noDocument = null;
        XElement? noElement = null;

        noDocument.Should().BeEquivalentTo(null).NotBeEquivalentTo(XDocument.Parse("<root />"));
        noElement.Should().BeEquivalentTo(null).NotBeEquivalentTo(XElement.Parse("<root />"));
        Assert.Throws<AstraFlowAssertionException>(() => noDocument.Should().BeEquivalentTo(XDocument.Parse("<root />")));
        Assert.Throws<AstraFlowAssertionException>(() => noElement.Should().BeEquivalentTo(XElement.Parse("<root />")));
        Assert.Throws<AstraFlowAssertionException>(() => noDocument.Should().NotBeEquivalentTo(null));
        Assert.Throws<AstraFlowAssertionException>(() => noElement.Should().NotBeEquivalentTo(null));
        XDocument.Parse("<root />").Should().NotBeEquivalentTo(null);
        XElement.Parse("<root />").Should().NotBeEquivalentTo(null);
    }

    [Fact]
    public void XmlEquivalency_ConsidersCommentsProcessingInstructionsAndDocumentTypes()
    {
        var subject = new XDocument(
            new XProcessingInstruction("mode", "safe"),
            new XElement("root", new XComment("private-comment")));
        var same = new XDocument(
            new XProcessingInstruction("mode", "safe"),
            new XElement("root", new XComment("private-comment")));
        var differentInstruction = new XDocument(
            new XProcessingInstruction("mode", "different"),
            new XElement("root", new XComment("private-comment")));

        subject.Should().BeEquivalentTo(same).NotBeEquivalentTo(differentInstruction);

        var typed = new XDocument(new XDocumentType("root", "public-id", "system-id", "subset"), new XElement("root"));
        var differentType = new XDocument(new XDocumentType("root", "different-public-id", "system-id", "subset"), new XElement("root"));
        typed.Should().NotBeEquivalentTo(differentType);

        var commentFailure = Assert.Throws<AstraFlowAssertionException>(() =>
            subject.Should().BeEquivalentTo(new XDocument(
                new XProcessingInstruction("mode", "safe"),
                new XElement("root", new XComment("expected-private-comment")))));
        Assert.DoesNotContain("private-comment", commentFailure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("expected-private-comment", commentFailure.Message, StringComparison.Ordinal);
    }
}
