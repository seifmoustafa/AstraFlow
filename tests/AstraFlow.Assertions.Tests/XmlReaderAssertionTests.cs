using System;
using System.Xml;
using System.Xml.Linq;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class XmlReaderAssertionTests
{
    [Fact]
    public void XmlReaderAssertions_InspectCurrentStateWithoutMovingOrClosingReader()
    {
        var reader = new GuardingXmlReader(ReadState.Initial, XmlNodeType.None, depth: 0);
        var assertions = reader.Should();

        Assert.Same(reader, assertions.Subject);
        Assert.Same(assertions, assertions
            .HaveReadState(ReadState.Initial)
            .HaveNodeType(XmlNodeType.None)
            .HaveDepth(0)
            .And);
        Assert.Equal(0, reader.NavigationCalls);
        Assert.Equal(0, reader.CloseCalls);
        Assert.Equal(0, reader.DisposeCalls);
    }

    [Fact]
    public void XmlReaderAssertions_MatchExpandedElementAndAttributeNamesWithoutUsingPrefix()
    {
        var element = new GuardingXmlReader(
            ReadState.Interactive,
            XmlNodeType.Element,
            depth: 1,
            localName: "item",
            namespaceUri: "urn:orders",
            prefix: "first");
        var attribute = new GuardingXmlReader(
            ReadState.Interactive,
            XmlNodeType.Attribute,
            depth: 2,
            localName: "id",
            namespaceUri: "urn:orders",
            prefix: "second");
        var endElement = new GuardingXmlReader(
            ReadState.Interactive,
            XmlNodeType.EndElement,
            depth: 1,
            localName: "item",
            namespaceUri: "urn:orders",
            prefix: "third");

        element.Should().HaveName(XName.Get("item", "urn:orders"));
        attribute.Should().HaveName(XName.Get("id", "urn:orders"));
        endElement.Should().HaveName(XName.Get("item", "urn:orders"));

        Assert.Equal(0, element.NavigationCalls);
        Assert.Equal(0, attribute.NavigationCalls);
        Assert.Equal(0, endElement.NavigationCalls);
        Assert.Equal(0, element.CloseCalls);
        Assert.Equal(0, attribute.CloseCalls);
        Assert.Equal(0, endElement.CloseCalls);
    }

    [Theory]
    [InlineData(ReadState.EndOfFile)]
    [InlineData(ReadState.Closed)]
    public void XmlReaderAssertions_CheckEndStatesWithoutNavigation(ReadState readState)
    {
        var reader = new GuardingXmlReader(readState, XmlNodeType.None, depth: 0);

        reader.Should().HaveReadState(readState).HaveNodeType(XmlNodeType.None);

        Assert.Equal(0, reader.NavigationCalls);
        Assert.Equal(0, reader.CloseCalls);
    }

    [Fact]
    public void XmlReaderAssertions_ValidateArgumentsBeforeReadingSubject()
    {
        var reader = new GuardingXmlReader(ReadState.Interactive, XmlNodeType.Element, depth: 1);
        var assertions = reader.Should();

        Assert.Throws<ArgumentOutOfRangeException>(() => assertions.HaveReadState((ReadState)999));
        Assert.Throws<ArgumentOutOfRangeException>(() => assertions.HaveNodeType((XmlNodeType)999));
        Assert.Throws<ArgumentOutOfRangeException>(() => assertions.HaveDepth(-1));
        Assert.Throws<ArgumentNullException>(() => assertions.HaveName(null!));
        Assert.Equal(0, reader.StateReads);
        Assert.Equal(0, reader.NodeTypeReads);
        Assert.Equal(0, reader.DepthReads);
        Assert.Equal(0, reader.NameReads);

        XmlReader? missing = null;
        Assert.Throws<AstraFlowAssertionException>(() => missing.Should().HaveReadState(ReadState.Initial));
        Assert.Throws<AstraFlowAssertionException>(() => missing.Should().HaveName(XName.Get("item")));
        Assert.Throws<ArgumentOutOfRangeException>(() => missing.Should().HaveReadState((ReadState)999));
        Assert.Throws<ArgumentNullException>(() => missing.Should().HaveName(null!));
    }

    [Fact]
    public void XmlReaderAssertions_FailForWrongNodeOrExpandedNameWithoutLeakingXmlData()
    {
        var text = new GuardingXmlReader(
            ReadState.Interactive,
            XmlNodeType.Text,
            depth: 2,
            localName: "private-local-name",
            namespaceUri: "urn:private-namespace");
        var nameMismatch = new GuardingXmlReader(
            ReadState.Interactive,
            XmlNodeType.Element,
            depth: 2,
            localName: "private-local-name",
            namespaceUri: "urn:private-namespace");

        var wrongNode = Assert.Throws<AstraFlowAssertionException>(() => text.Should().HaveName(XName.Get("secret")));
        var wrongName = Assert.Throws<AstraFlowAssertionException>(() => nameMismatch.Should().HaveName(XName.Get("expected-secret")));

        Assert.DoesNotContain("private-local-name", wrongNode.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("secret", wrongNode.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("private-local-name", wrongName.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("urn:private-namespace", wrongName.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("expected-secret", wrongName.Message, StringComparison.Ordinal);
        Assert.Equal(0, text.NavigationCalls);
        Assert.Equal(0, nameMismatch.NavigationCalls);
        Assert.Equal(0, text.CloseCalls);
        Assert.Equal(0, nameMismatch.CloseCalls);
        Assert.Equal(0, text.DisposeCalls);
        Assert.Equal(0, nameMismatch.DisposeCalls);
    }

    [Fact]
    public void XmlReaderAssertions_PropagateReaderPropertyExceptionsUnchanged()
    {
        var expected = new InvalidOperationException("reader state unavailable");
        var reader = new GuardingXmlReader(ReadState.Interactive, XmlNodeType.Element, depth: 1)
        {
            ReadStateFailure = expected
        };

        var observed = Assert.Throws<InvalidOperationException>(() => reader.Should().HaveReadState(ReadState.Interactive));

        Assert.Same(expected, observed);
        Assert.Equal(0, reader.NavigationCalls);
        Assert.Equal(0, reader.CloseCalls);
    }

    private sealed class GuardingXmlReader : XmlReader
    {
        private readonly ReadState _readState;
        private readonly XmlNodeType _nodeType;
        private readonly int _depth;
        private readonly string _localName;
        private readonly string _namespaceUri;
        private readonly string _prefix;

        public GuardingXmlReader(
            ReadState readState,
            XmlNodeType nodeType,
            int depth,
            string localName = "",
            string namespaceUri = "",
            string prefix = "")
        {
            _readState = readState;
            _nodeType = nodeType;
            _depth = depth;
            _localName = localName;
            _namespaceUri = namespaceUri;
            _prefix = prefix;
        }

        public int NavigationCalls { get; private set; }

        public int CloseCalls { get; private set; }

        public int DisposeCalls { get; private set; }

        public int StateReads { get; private set; }

        public int NodeTypeReads { get; private set; }

        public int DepthReads { get; private set; }

        public int NameReads { get; private set; }

        public Exception? ReadStateFailure { get; set; }

        public override int AttributeCount => 0;

        public override string BaseURI => string.Empty;

        public override int Depth
        {
            get
            {
                DepthReads++;
                return _depth;
            }
        }

        public override bool EOF => _readState == ReadState.EndOfFile;

        public override bool HasValue => false;

        public override bool IsDefault => false;

        public override bool IsEmptyElement => false;

        public override string LocalName
        {
            get
            {
                NameReads++;
                return _localName;
            }
        }

        public override string NamespaceURI
        {
            get
            {
                NameReads++;
                return _namespaceUri;
            }
        }

        public override XmlNameTable NameTable => new NameTable();

        public override XmlNodeType NodeType
        {
            get
            {
                NodeTypeReads++;
                return _nodeType;
            }
        }

        public override string Prefix => _prefix;

        public override ReadState ReadState
        {
            get
            {
                StateReads++;
                if (ReadStateFailure is not null)
                {
                    throw ReadStateFailure;
                }

                return _readState;
            }
        }

        public override string Value => string.Empty;

        public override bool CanResolveEntity => false;

        public override void Close() => CloseCalls++;

        public override string? GetAttribute(string name) => null;

        public override string? GetAttribute(string name, string? namespaceURI) => null;

        public override string GetAttribute(int i) => string.Empty;

        public override string? LookupNamespace(string prefix) => null;

        public override bool MoveToAttribute(string name) => NavigationFailure<bool>();

        public override bool MoveToAttribute(string name, string? ns) => NavigationFailure<bool>();

        public override void MoveToAttribute(int i) => NavigationFailure();

        public override bool MoveToFirstAttribute() => NavigationFailure<bool>();

        public override bool MoveToNextAttribute() => NavigationFailure<bool>();

        public override bool MoveToElement() => NavigationFailure<bool>();

        public override bool Read() => NavigationFailure<bool>();

        public override bool ReadAttributeValue() => NavigationFailure<bool>();

        public override void ResolveEntity() => NavigationFailure();

        protected override void Dispose(bool disposing)
        {
            DisposeCalls++;
            base.Dispose(disposing);
        }

        private T NavigationFailure<T>()
        {
            NavigationCalls++;
            throw new InvalidOperationException("Reader navigation must not be requested by a state assertion.");
        }

        private void NavigationFailure()
        {
            NavigationCalls++;
            throw new InvalidOperationException("Reader navigation must not be requested by a state assertion.");
        }
    }
}
