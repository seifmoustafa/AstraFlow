using System;
using System.IO;
using System.Runtime.ExceptionServices;

namespace AstraFlow.Assertions;

/// <summary>Assertions about stream capabilities and seekable metadata.</summary>
public sealed class StreamAssertions
{
    private readonly Stream? _subject;

    internal StreamAssertions(Stream? subject) => _subject = subject;

    /// <summary>Asserts that the stream reports that it can read.</summary>
    public StreamAssertions BeReadable() => CheckCapability(stream => stream.CanRead, "readable");

    /// <summary>Asserts that the stream reports that it cannot read.</summary>
    public StreamAssertions NotBeReadable() => CheckCapability(stream => !stream.CanRead, "not readable");

    /// <summary>Asserts that the stream reports that it can write.</summary>
    public StreamAssertions BeWritable() => CheckCapability(stream => stream.CanWrite, "writable");

    /// <summary>Asserts that the stream reports that it cannot write.</summary>
    public StreamAssertions NotBeWritable() => CheckCapability(stream => !stream.CanWrite, "not writable");

    /// <summary>Asserts that the stream is readable and not writable.</summary>
    public StreamAssertions BeReadOnly() => CheckCapability(stream => stream.CanRead && !stream.CanWrite, "read-only");

    /// <summary>Asserts that the stream is not both readable and not writable.</summary>
    public StreamAssertions NotBeReadOnly() => CheckCapability(stream => !stream.CanRead || stream.CanWrite, "not read-only");

    /// <summary>Asserts that the stream is writable and not readable.</summary>
    public StreamAssertions BeWriteOnly() => CheckCapability(stream => stream.CanWrite && !stream.CanRead, "write-only");

    /// <summary>Asserts that the stream is not both writable and not readable.</summary>
    public StreamAssertions NotBeWriteOnly() => CheckCapability(stream => !stream.CanWrite || stream.CanRead, "not write-only");

    /// <summary>Asserts that the stream reports that it supports seeking.</summary>
    public StreamAssertions BeSeekable() => CheckCapability(stream => stream.CanSeek, "seekable");

    /// <summary>Asserts that the stream reports that it does not support seeking.</summary>
    public StreamAssertions NotBeSeekable() => CheckCapability(stream => !stream.CanSeek, "not seekable");

    /// <summary>Asserts that a seekable stream has the expected length without changing it.</summary>
    public StreamAssertions HaveLength(long expected)
    {
        ValidateNonNegative(expected, nameof(expected));
        var stream = RequireSeekable("length");
        var actual = ReadLength(stream);
        if (actual != expected)
        {
            AssertionFailure.Fail($"Expected a stream length of {expected}, but found {actual}.");
        }

        return this;
    }

    /// <summary>Asserts that a seekable stream has the expected current position without changing it.</summary>
    public StreamAssertions HavePosition(long expected)
    {
        ValidateNonNegative(expected, nameof(expected));
        var stream = RequireSeekable("position");
        var actual = ReadPosition(stream);
        if (actual != expected)
        {
            AssertionFailure.Fail($"Expected a stream position of {expected}, but found {actual}.");
        }

        return this;
    }

    /// <summary>Asserts that a seekable stream does not have the specified current position.</summary>
    public StreamAssertions NotHavePosition(long unexpected)
    {
        ValidateNonNegative(unexpected, nameof(unexpected));
        var stream = RequireSeekable("position");
        var actual = ReadPosition(stream);
        if (actual == unexpected)
        {
            AssertionFailure.Fail($"Expected the stream position not to be {unexpected}, but it was.");
        }

        return this;
    }

    /// <summary>Asserts that a seekable stream does not have the specified length.</summary>
    public StreamAssertions NotHaveLength(long unexpected)
    {
        ValidateNonNegative(unexpected, nameof(unexpected));
        var stream = RequireSeekable("length");
        var actual = ReadLength(stream);
        if (actual == unexpected)
        {
            AssertionFailure.Fail($"Expected the stream length not to be {unexpected}, but it was.");
        }

        return this;
    }

#if !NETSTANDARD2_0
    /// <summary>Asserts that a buffered stream uses the specified buffer size.</summary>
    public StreamAssertions HaveBufferSize(int expected)
    {
        ValidateNonNegative(expected, nameof(expected));
        var stream = RequireBufferedStream();
        var actual = stream.BufferSize;
        if (actual != expected)
        {
            AssertionFailure.Fail($"Expected a buffered stream buffer size of {expected}, but found {actual}.");
        }

        return this;
    }

    /// <summary>Asserts that a buffered stream does not use the specified buffer size.</summary>
    public StreamAssertions NotHaveBufferSize(int unexpected)
    {
        ValidateNonNegative(unexpected, nameof(unexpected));
        var stream = RequireBufferedStream();
        var actual = stream.BufferSize;
        if (actual == unexpected)
        {
            AssertionFailure.Fail($"Expected a buffered stream buffer size not to be {unexpected}, but it was.");
        }

        return this;
    }
#endif

    /// <summary>Asserts that the current position equals the stream length.</summary>
    public StreamAssertions BeAtEnd()
    {
        var stream = RequireSeekable("end position");
        var length = ReadLength(stream);
        var position = ReadPosition(stream);
        if (position != length)
        {
            AssertionFailure.Fail("Expected the stream position to be at its end.");
        }

        return this;
    }

    /// <summary>Asserts that the current position is zero.</summary>
    public StreamAssertions BeAtBeginning()
    {
        var stream = RequireSeekable("beginning position");
        if (ReadPosition(stream) != 0)
        {
            AssertionFailure.Fail("Expected the stream position to be at its beginning.");
        }

        return this;
    }

    /// <summary>
    /// Asserts that the bytes available from the stream's current position exactly match the expected content.
    /// Seekable streams are returned to their original position. Non-seekable streams are consumed through the end
    /// of the expected content and one additional byte when needed to verify that no trailing content exists.
    /// </summary>
    /// <param name="expectedContent">The exact byte sequence expected from the current stream position.</param>
    /// <returns>This assertion object for fluent chaining.</returns>
    /// <exception cref="ArgumentNullException"><paramref name="expectedContent"/> is null.</exception>
    /// <exception cref="AstraFlowAssertionException">The stream cannot be read or its content differs.</exception>
    public StreamAssertions HaveContent(byte[] expectedContent)
        => CheckContent(expectedContent, shouldMatch: true);

    /// <summary>
    /// Asserts that the bytes available from the stream's current position do not exactly match the unexpected content.
    /// Seekable streams are returned to their original position. Non-seekable streams may be consumed while checking.
    /// </summary>
    /// <param name="unexpectedContent">The byte sequence that must not exactly match the stream content.</param>
    /// <returns>This assertion object for fluent chaining.</returns>
    /// <exception cref="ArgumentNullException"><paramref name="unexpectedContent"/> is null.</exception>
    /// <exception cref="AstraFlowAssertionException">The stream cannot be read or its content matches.</exception>
    public StreamAssertions NotHaveContent(byte[] unexpectedContent)
        => CheckContent(unexpectedContent, shouldMatch: false);

    private StreamAssertions CheckContent(byte[] expectedContent, bool shouldMatch)
    {
        if (expectedContent is null)
        {
            throw new ArgumentNullException(nameof(expectedContent));
        }

        var stream = RequireSubject();
        bool canRead;
        try
        {
            canRead = stream.CanRead;
        }
        catch (ObjectDisposedException)
        {
            AssertionFailure.Fail("Expected a readable stream to compare its content, but the stream was disposed.");
            return this;
        }

        if (!canRead)
        {
            AssertionFailure.Fail("Expected a readable stream to compare its content.");
        }

        bool canSeek;
        try
        {
            canSeek = stream.CanSeek;
        }
        catch (ObjectDisposedException)
        {
            AssertionFailure.Fail("Expected a stream with available content, but the stream was disposed.");
            return this;
        }

        long? originalPosition = canSeek ? ReadPosition(stream) : null;
        bool matches = false;
        Exception? readException = null;
        try
        {
            matches = ContentMatches(stream, expectedContent);
        }
        catch (Exception exception)
        {
            readException = exception;
        }

        Exception? restoreException = null;
        if (originalPosition.HasValue)
        {
            try
            {
                stream.Position = originalPosition.Value;
            }
            catch (Exception exception)
            {
                restoreException = exception;
            }
        }

        if (readException is ObjectDisposedException)
        {
            AssertionFailure.Fail("Expected a readable stream to compare its content, but the stream was disposed while reading.");
        }

        if (readException is not null)
        {
            ExceptionDispatchInfo.Capture(readException).Throw();
        }

        if (restoreException is ObjectDisposedException or NotSupportedException)
        {
            AssertionFailure.Fail("Expected a seekable stream whose original position can be restored after checking its content.");
        }

        if (restoreException is not null)
        {
            ExceptionDispatchInfo.Capture(restoreException).Throw();
        }

        if (matches != shouldMatch)
        {
            var expectation = shouldMatch ? "match" : "not to match";
            AssertionFailure.Fail($"Expected stream content {expectation} the expected byte sequence (length {expectedContent.Length}).");
        }

        return this;
    }

    private static bool ContentMatches(Stream stream, byte[] expectedContent)
    {
        const int bufferSize = 4096;
        var buffer = new byte[bufferSize];
        var offset = 0;

        while (offset < expectedContent.Length)
        {
            var requested = Math.Min(buffer.Length, expectedContent.Length - offset);
            var read = stream.Read(buffer, 0, requested);
            if (read == 0)
            {
                return false;
            }

            for (var index = 0; index < read; index++)
            {
                if (buffer[index] != expectedContent[offset + index])
                {
                    return false;
                }
            }

            offset += read;
        }

        return stream.Read(buffer, 0, 1) == 0;
    }

    private StreamAssertions CheckCapability(Func<Stream, bool> predicate, string expectedState)
    {
        var stream = RequireSubject();
        bool matches;
        try
        {
            matches = predicate(stream);
        }
        catch (ObjectDisposedException)
        {
            AssertionFailure.Fail($"Expected a stream that is {expectedState}, but the stream was disposed.");
            return this;
        }

        if (!matches)
        {
            AssertionFailure.Fail($"Expected a stream that is {expectedState}.");
        }

        return this;
    }

    private Stream RequireSeekable(string property)
    {
        var stream = RequireSubject();
        bool canSeek;
        try
        {
            canSeek = stream.CanSeek;
        }
        catch (ObjectDisposedException)
        {
            AssertionFailure.Fail($"Expected a seekable stream to expose its {property}, but the stream was disposed.");
            return stream;
        }

        if (!canSeek)
        {
            AssertionFailure.Fail($"Expected a seekable stream to expose its {property}.");
        }

        return stream;
    }

#if !NETSTANDARD2_0
    private BufferedStream RequireBufferedStream()
    {
        var stream = RequireSubject();
        if (stream is not BufferedStream bufferedStream)
        {
            AssertionFailure.Fail("Expected the subject to be a buffered stream.");
        }

        return (BufferedStream)stream;
    }
#endif

    private Stream RequireSubject()
    {
        if (_subject is null)
        {
            AssertionFailure.Fail("Expected a non-null stream.");
        }

        return _subject;
    }

    private static long ReadLength(Stream stream)
    {
        try
        {
            return stream.Length;
        }
        catch (NotSupportedException)
        {
            AssertionFailure.Fail("Expected a seekable stream with a supported length property.");
            return 0;
        }
        catch (ObjectDisposedException)
        {
            AssertionFailure.Fail("Expected a stream with an available length, but the stream was disposed.");
            return 0;
        }
    }

    private static long ReadPosition(Stream stream)
    {
        try
        {
            return stream.Position;
        }
        catch (NotSupportedException)
        {
            AssertionFailure.Fail("Expected a seekable stream with a supported position property.");
            return 0;
        }
        catch (ObjectDisposedException)
        {
            AssertionFailure.Fail("Expected a stream with an available position, but the stream was disposed.");
            return 0;
        }
    }

    private static void ValidateNonNegative(long value, string parameterName)
    {
        if (value < 0)
        {
            throw new ArgumentOutOfRangeException(parameterName, "Stream length and position expectations must be nonnegative.");
        }
    }
}
