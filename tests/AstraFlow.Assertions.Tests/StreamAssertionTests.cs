using System;
using System.IO;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class StreamAssertionTests
{
    [Fact]
    public void StreamAssertions_CheckCapabilitiesWithoutConsumingOrChangingPosition()
    {
        using var stream = new CountingMemoryStream(new byte[] { 1, 2, 3, 4 });
        stream.Position = 2;

        var assertions = stream.Should();
        Assert.Same(assertions, assertions.BeReadable().BeWritable().BeSeekable().HaveLength(4).HavePosition(2));
        Assert.Equal(2, stream.Position);
        Assert.Equal(0, stream.ReadCount);
        Assert.Equal(0, stream.SeekCount);
    }

    [Fact]
    public void StreamAssertions_CheckReadOnlyAndWriteOnlyModes()
    {
        using var readOnly = new MemoryStream(new byte[] { 1, 2 }, writable: false);
        using var writeOnly = new WriteOnlyStream();
        using var readWrite = new MemoryStream();

        var readOnlyAssertions = readOnly.Should();
        var writeOnlyAssertions = writeOnly.Should();
        var readWriteAssertions = readWrite.Should();
        Assert.Same(readOnlyAssertions, readOnlyAssertions.BeReadOnly().NotBeWriteOnly());
        Assert.Same(writeOnlyAssertions, writeOnlyAssertions.BeWriteOnly().NotBeReadOnly());
        Assert.Same(readWriteAssertions, readWriteAssertions.NotBeReadOnly().NotBeWriteOnly());
        Assert.Throws<AstraFlowAssertionException>(() => readOnly.Should().NotBeReadOnly());
        Assert.Throws<AstraFlowAssertionException>(() => readOnly.Should().BeWriteOnly());
        Assert.Throws<AstraFlowAssertionException>(() => writeOnly.Should().NotBeWriteOnly());
        Assert.Throws<AstraFlowAssertionException>(() => writeOnly.Should().BeReadOnly());
    }

    [Fact]
    public void StreamAssertions_CheckBeginningAndEndWithoutSeeking()
    {
        using var beginning = new CountingMemoryStream(new byte[] { 1, 2, 3 });
        beginning.Should().BeAtBeginning();
        Assert.Equal(0, beginning.Position);
        Assert.Equal(0, beginning.SeekCount);

        using var end = new CountingMemoryStream(new byte[] { 1, 2, 3 });
        end.Position = end.Length;
        end.Should().BeAtEnd();
        Assert.Equal(end.Length, end.Position);
        Assert.Equal(0, end.SeekCount);
    }

    [Fact]
    public void StreamAssertions_ReportNullAndCapabilityMismatchesAsAssertionFailures()
    {
        Stream? missing = null;
        using var stream = new MemoryStream();

        Assert.Throws<AstraFlowAssertionException>(() => missing.Should().BeReadable());
        Assert.Throws<AstraFlowAssertionException>(() => stream.Should().NotBeReadable());
        Assert.Throws<AstraFlowAssertionException>(() => stream.Should().NotBeWritable());
        Assert.Throws<AstraFlowAssertionException>(() => stream.Should().NotBeSeekable());
    }

    [Fact]
    public void StreamAssertions_RequireSeekableStreamForPositionAndLength()
    {
        using var stream = new NonSeekableStream();

        Assert.Throws<AstraFlowAssertionException>(() => stream.Should().HaveLength(0));
        Assert.Throws<AstraFlowAssertionException>(() => stream.Should().HavePosition(0));
        Assert.Throws<AstraFlowAssertionException>(() => stream.Should().BeAtBeginning());
        Assert.Throws<AstraFlowAssertionException>(() => stream.Should().BeAtEnd());
        Assert.Equal(0, stream.ReadCount);
        Assert.Equal(0, stream.SeekCount);
    }

    [Fact]
    public void StreamAssertions_ConvertUnsupportedMetadataAndDisposedStreamToSafeFailures()
    {
        using var unsupported = new UnsupportedMetadataStream();
        Assert.Throws<AstraFlowAssertionException>(() => unsupported.Should().HaveLength(0));
        Assert.Throws<AstraFlowAssertionException>(() => unsupported.Should().HavePosition(0));
        Assert.Throws<AstraFlowAssertionException>(() => unsupported.Should().BeAtEnd());

        var disposed = new MemoryStream(new byte[] { 1 });
        disposed.Dispose();
        Assert.Throws<AstraFlowAssertionException>(() => disposed.Should().BeReadable());
        Assert.Throws<AstraFlowAssertionException>(() => disposed.Should().HaveLength(1));
    }

    [Fact]
    public void StreamAssertions_RejectNegativeExpectationsBeforeReadingMetadata()
    {
        using var stream = new CountingMemoryStream();

        Assert.Throws<ArgumentOutOfRangeException>(() => stream.Should().HaveLength(-1));
        Assert.Throws<ArgumentOutOfRangeException>(() => stream.Should().HavePosition(-1));
        Assert.Throws<ArgumentOutOfRangeException>(() => stream.Should().NotHaveLength(-1));
        Assert.Throws<ArgumentOutOfRangeException>(() => stream.Should().NotHavePosition(-1));
        Assert.Equal(0, stream.ReadCount);
        Assert.Equal(0, stream.SeekCount);
    }

    [Fact]
    public void StreamAssertions_PreserveUnexpectedIoExceptions()
    {
        using var stream = new IoFailingMetadataStream();

        var exception = Assert.Throws<IOException>(() => stream.Should().HaveLength(0));
        Assert.Equal("private stream detail", exception.Message);
    }

    [Fact]
    public void StreamAssertions_CheckNegativeMetadataWithoutConsumingOrChangingPosition()
    {
        using var stream = new CountingMemoryStream(new byte[] { 1, 2, 3, 4 });
        stream.Position = 2;

        var assertions = stream.Should();
        Assert.Same(assertions, assertions.NotHaveLength(3).NotHavePosition(1));
        Assert.Throws<AstraFlowAssertionException>(() => stream.Should().NotHaveLength(4));
        Assert.Throws<AstraFlowAssertionException>(() => stream.Should().NotHavePosition(2));
        Assert.Equal(2, stream.Position);
        Assert.Equal(0, stream.ReadCount);
        Assert.Equal(0, stream.SeekCount);
    }

    [Fact]
    public void StreamAssertions_CheckBufferedStreamSizeWithoutReadingOrDisposing()
    {
        var inner = new CountingMemoryStream(new byte[] { 1, 2, 3 });
        using var buffered = new BufferedStream(inner, 64);

        var assertions = buffered.Should();
        Assert.Same(assertions, assertions.HaveBufferSize(64).NotHaveBufferSize(128));
        Assert.Throws<AstraFlowAssertionException>(() => buffered.Should().HaveBufferSize(32));
        Assert.Throws<AstraFlowAssertionException>(() => buffered.Should().NotHaveBufferSize(64));
        Assert.Throws<AstraFlowAssertionException>(() => inner.Should().HaveBufferSize(64));
        Assert.Equal(0, inner.ReadCount);
        Assert.Equal(0, inner.SeekCount);
        Assert.True(inner.CanRead);
    }

    [Fact]
    public void StreamAssertions_CompareExactContentFromCurrentPositionAndRestoreSeekableStream()
    {
        using var stream = new CountingMemoryStream(new byte[] { 9, 1, 2 });
        stream.Position = 1;

        var assertions = stream.Should();
        Assert.Same(assertions, assertions.HaveContent(new byte[] { 1, 2 }).NotHaveContent(new byte[] { 1, 3 }));
        Assert.Equal(1, stream.Position);
        Assert.True(stream.ReadCount > 0);
        Assert.Equal(0, stream.SeekCount);
    }

    [Fact]
    public void StreamAssertions_ContentComparisonRequiresAnExactLengthAndKeepsFailuresPrivate()
    {
        using var stream = new CountingMemoryStream(System.Text.Encoding.UTF8.GetBytes("private-content"));
        stream.Position = 2;

        var mismatch = Assert.Throws<AstraFlowAssertionException>(
            () => stream.Should().HaveContent(System.Text.Encoding.UTF8.GetBytes("different-secret")));
        Assert.DoesNotContain("private-content", mismatch.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("different-secret", mismatch.Message, StringComparison.Ordinal);
        Assert.Equal(2, stream.Position);

        using var trailing = new MemoryStream(new byte[] { 1, 2, 3 });
        Assert.Throws<AstraFlowAssertionException>(() => trailing.Should().HaveContent(new byte[] { 1, 2 }));
        Assert.Throws<AstraFlowAssertionException>(() => trailing.Should().NotHaveContent(new byte[] { 1, 2, 3 }));

        using var empty = new MemoryStream();
        empty.Should().HaveContent(Array.Empty<byte>());
        Assert.Throws<AstraFlowAssertionException>(() => trailing.Should().HaveContent(Array.Empty<byte>()));
    }

    [Fact]
    public void StreamAssertions_CompareNonSeekableContentAndConsumeIt()
    {
        using var stream = new NonSeekableStream(new byte[] { 1, 2, 3 }, maxReadSize: 2);

        stream.Should().HaveContent(new byte[] { 1, 2, 3 });

        Assert.Equal(3, stream.BytesRead);
        Assert.True(stream.ReadCount >= 3);
        Assert.Equal(0, stream.SeekCount);
    }

    [Fact]
    public void StreamAssertions_ContentComparisonRequiresReadableStreamAndPreservesUnexpectedIoErrors()
    {
        using var writeOnly = new WriteOnlyStream();
        Assert.Throws<AstraFlowAssertionException>(() => writeOnly.Should().HaveContent(Array.Empty<byte>()));
        Assert.Throws<ArgumentNullException>(() => HaveNullContent());

        using var failing = new IoFailingReadStream();
        failing.Position = 2;
        var exception = Assert.Throws<IOException>(() => failing.Should().HaveContent(new byte[] { 1 }));
        Assert.Equal("private stream detail", exception.Message);
        Assert.Equal(2, failing.Position);

        static void HaveNullContent()
        {
            using var stream = new MemoryStream();
            stream.Should().HaveContent(null!);
        }
    }

    private sealed class CountingMemoryStream : MemoryStream
    {
        public CountingMemoryStream() { }

        public CountingMemoryStream(byte[] buffer) : base(buffer) { }

        public int ReadCount { get; private set; }
        public int SeekCount { get; private set; }

        public override int Read(byte[] buffer, int offset, int count)
        {
            ReadCount++;
            return base.Read(buffer, offset, count);
        }

        public override long Seek(long offset, SeekOrigin loc)
        {
            SeekCount++;
            return base.Seek(offset, loc);
        }
    }

    private sealed class NonSeekableStream : Stream
    {
        private readonly byte[] _content;
        private readonly int _maxReadSize;
        private int _offset;

        public NonSeekableStream(byte[]? content = null, int maxReadSize = int.MaxValue)
        {
            _content = content ?? Array.Empty<byte>();
            _maxReadSize = maxReadSize;
        }

        public int ReadCount { get; private set; }
        public int SeekCount { get; private set; }
        public int BytesRead => _offset;
        public override bool CanRead => true;
        public override bool CanSeek => false;
        public override bool CanWrite => false;
        public override long Length => throw new NotSupportedException();
        public override long Position { get => throw new NotSupportedException(); set => throw new NotSupportedException(); }

        public override int Read(byte[] buffer, int offset, int count)
        {
            ReadCount++;
            var read = Math.Min(Math.Min(count, _maxReadSize), _content.Length - _offset);
            Array.Copy(_content, _offset, buffer, offset, read);
            _offset += read;
            return read;
        }

        public override long Seek(long offset, SeekOrigin loc)
        {
            SeekCount++;
            throw new NotSupportedException();
        }

        public override void Flush() { }
        public override void SetLength(long value) => throw new NotSupportedException();
        public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();
    }

    private sealed class WriteOnlyStream : Stream
    {
        public override bool CanRead => false;
        public override bool CanSeek => false;
        public override bool CanWrite => true;
        public override long Length => throw new NotSupportedException();
        public override long Position { get => throw new NotSupportedException(); set => throw new NotSupportedException(); }
        public override void Flush() { }
        public override int Read(byte[] buffer, int offset, int count) => throw new NotSupportedException();
        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();
        public override void SetLength(long value) => throw new NotSupportedException();
        public override void Write(byte[] buffer, int offset, int count) { }
    }

    private sealed class UnsupportedMetadataStream : MemoryStream
    {
        public override bool CanSeek => true;
        public override long Length => throw new NotSupportedException();
        public override long Position { get => throw new NotSupportedException(); set => throw new NotSupportedException(); }
    }

    private sealed class IoFailingMetadataStream : MemoryStream
    {
        public override bool CanSeek => true;
        public override long Length => throw new IOException("private stream detail");
    }

    private sealed class IoFailingReadStream : MemoryStream
    {
        public override int Read(byte[] buffer, int offset, int count)
            => throw new IOException("private stream detail");
    }
}
