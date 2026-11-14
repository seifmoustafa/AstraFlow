using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace AstraFlow.Assertions;

/// <summary>Assertions for HTTP response status, headers, and text content.</summary>
/// <remarks>Status and header checks inspect metadata only. Text-content checks read and buffer the response content. No assertion disposes the response or its content.</remarks>
public sealed class HttpResponseMessageAssertions
{
    /// <summary>Gets the response being asserted.</summary>
    public HttpResponseMessage? Subject { get; }

    /// <summary>Returns this assertion object for a related check.</summary>
    public HttpResponseMessageAssertions And => this;

    internal HttpResponseMessageAssertions(HttpResponseMessage? subject) => Subject = subject;

    /// <summary>Asserts that the response has the expected status code.</summary>
    public HttpResponseMessageAssertions HaveStatusCode(HttpStatusCode expected)
    {
        var response = RequireSubject();
        if (response.StatusCode != expected)
        {
            AssertionFailure.Fail($"Expected HTTP response status '{expected}', but found '{response.StatusCode}'.");
        }

        return this;
    }

    /// <summary>Asserts that the response does not have the specified status code.</summary>
    public HttpResponseMessageAssertions NotHaveStatusCode(HttpStatusCode unexpected)
    {
        if (RequireSubject().StatusCode == unexpected)
        {
            AssertionFailure.Fail($"Expected HTTP response not to have status '{unexpected}'.");
        }

        return this;
    }

    /// <summary>Asserts that the response status code is in the success range.</summary>
    public HttpResponseMessageAssertions BeSuccessful()
    {
        var statusCode = (int)RequireSubject().StatusCode;
        if (statusCode is < 200 or > 299)
        {
            AssertionFailure.Fail("Expected HTTP response to have a 2xx success status code.");
        }

        return this;
    }

    /// <summary>Asserts that the response status code is not in the success range.</summary>
    public HttpResponseMessageAssertions NotBeSuccessful()
    {
        var statusCode = (int)RequireSubject().StatusCode;
        if (statusCode is >= 200 and <= 299)
        {
            AssertionFailure.Fail("Expected HTTP response not to have a 2xx success status code.");
        }

        return this;
    }

    /// <summary>Asserts that the response contains a header with the supplied name.</summary>
    public HttpResponseMessageAssertions HaveResponseHeader(string name)
        => CheckHeader(RequireSubject().Headers, name, expectedValue: null, shouldExist: true, "response");

    /// <summary>Asserts that the response does not contain a header with the supplied name.</summary>
    public HttpResponseMessageAssertions NotHaveResponseHeader(string name)
        => CheckHeader(RequireSubject().Headers, name, expectedValue: null, shouldExist: false, "response");

    /// <summary>Asserts that a response header has a value equal to the expected text using ordinal comparison.</summary>
    public HttpResponseMessageAssertions HaveResponseHeaderValue(string name, string expectedValue)
        => CheckHeader(RequireSubject().Headers, name, ValidateExpectedValue(expectedValue, nameof(expectedValue)), shouldExist: true, "response", checkValue: true);

    /// <summary>Asserts that a response header does not have a value equal to the supplied text.</summary>
    public HttpResponseMessageAssertions NotHaveResponseHeaderValue(string name, string unexpectedValue)
        => CheckHeader(RequireSubject().Headers, name, ValidateExpectedValue(unexpectedValue, nameof(unexpectedValue)), shouldExist: false, "response", checkValue: true);

    /// <summary>Asserts that the response content contains a header with the supplied name.</summary>
    public HttpResponseMessageAssertions HaveContentHeader(string name)
        => CheckContentHeader(name, expectedValue: null, shouldExist: true);

    /// <summary>Asserts that the response content does not contain a header with the supplied name.</summary>
    public HttpResponseMessageAssertions NotHaveContentHeader(string name)
        => CheckContentHeader(name, expectedValue: null, shouldExist: false);

    /// <summary>Asserts that a content header has a value equal to the expected text using ordinal comparison.</summary>
    public HttpResponseMessageAssertions HaveContentHeaderValue(string name, string expectedValue)
        => CheckContentHeader(name, ValidateExpectedValue(expectedValue, nameof(expectedValue)), shouldExist: true, checkValue: true);

    /// <summary>Asserts that a content header does not have a value equal to the supplied text.</summary>
    public HttpResponseMessageAssertions NotHaveContentHeaderValue(string name, string unexpectedValue)
        => CheckContentHeader(name, ValidateExpectedValue(unexpectedValue, nameof(unexpectedValue)), shouldExist: false, checkValue: true);

    /// <summary>Asynchronously asserts that the response text equals the supplied text using ordinal comparison.</summary>
    /// <remarks>Reading text buffers the response content. The response and content are not disposed.</remarks>
    public async Task<HttpResponseMessageAssertions> HaveContentAsync(string expectedContent)
    {
        ValidateExpectedValue(expectedContent, nameof(expectedContent));
        var content = await ReadContentAsync().ConfigureAwait(false);
        if (!string.Equals(content, expectedContent, StringComparison.Ordinal))
        {
            AssertionFailure.Fail("Expected HTTP response content to equal the supplied text.");
        }

        return this;
    }

    /// <summary>Asynchronously asserts that the response text does not equal the supplied text using ordinal comparison.</summary>
    /// <remarks>Reading text buffers the response content. The response and content are not disposed.</remarks>
    public async Task<HttpResponseMessageAssertions> NotHaveContentAsync(string unexpectedContent)
    {
        ValidateExpectedValue(unexpectedContent, nameof(unexpectedContent));
        var content = await ReadContentAsync().ConfigureAwait(false);
        if (string.Equals(content, unexpectedContent, StringComparison.Ordinal))
        {
            AssertionFailure.Fail("Expected HTTP response content not to equal the supplied text.");
        }

        return this;
    }

    /// <summary>Asynchronously asserts that the response text contains the supplied text using ordinal comparison.</summary>
    /// <remarks>Reading text buffers the response content. The response and content are not disposed.</remarks>
    public async Task<HttpResponseMessageAssertions> ContainContentAsync(string expectedContent)
    {
        ValidateExpectedValue(expectedContent, nameof(expectedContent));
        var content = await ReadContentAsync().ConfigureAwait(false);
        if (content.IndexOf(expectedContent, StringComparison.Ordinal) < 0)
        {
            AssertionFailure.Fail("Expected HTTP response content to contain the supplied text.");
        }

        return this;
    }

    /// <summary>Asynchronously asserts that the response text does not contain the supplied text using ordinal comparison.</summary>
    /// <remarks>Reading text buffers the response content. The response and content are not disposed.</remarks>
    public async Task<HttpResponseMessageAssertions> NotContainContentAsync(string unexpectedContent)
    {
        ValidateExpectedValue(unexpectedContent, nameof(unexpectedContent));
        var content = await ReadContentAsync().ConfigureAwait(false);
        if (content.IndexOf(unexpectedContent, StringComparison.Ordinal) >= 0)
        {
            AssertionFailure.Fail("Expected HTTP response content not to contain the supplied text.");
        }

        return this;
    }

    private async Task<string> ReadContentAsync()
    {
        var content = RequireSubject().Content;
        return content is null
            ? string.Empty
            : await content.ReadAsStringAsync().ConfigureAwait(false);
    }

    private HttpResponseMessageAssertions CheckContentHeader(string name, string? expectedValue, bool shouldExist, bool checkValue = false)
    {
        var contentHeaders = RequireSubject().Content?.Headers;
        if (contentHeaders is null)
        {
            ValidateHeaderName(name);
            if (shouldExist)
            {
                AssertionFailure.Fail("Expected HTTP response content to contain the requested header.");
            }

            return this;
        }

        return CheckHeader(contentHeaders, name, expectedValue, shouldExist, "content", checkValue);
    }

    private HttpResponseMessageAssertions CheckHeader(
        HttpHeaders headers,
        string name,
        string? expectedValue,
        bool shouldExist,
        string headerKind,
        bool checkValue = false)
    {
        ValidateHeaderName(name);
        if (!checkValue)
        {
            if (headers.Contains(name) != shouldExist)
            {
                var expectation = shouldExist ? "to contain" : "not to contain";
                AssertionFailure.Fail($"Expected HTTP response {headerKind} {expectation} header '{name}'.");
            }

            return this;
        }

        var expectedHeaderValue = expectedValue!;
        var containsValue = headers.TryGetValues(name, out IEnumerable<string>? values)
            && ContainsValue(values, expectedHeaderValue);
        if (containsValue != shouldExist)
        {
            var expectation = shouldExist ? "to contain the requested value in" : "not to contain the requested value in";
            AssertionFailure.Fail($"Expected HTTP response {headerKind} header '{name}' {expectation} its values.");
        }

        return this;
    }

    private static string ValidateExpectedValue(string? value, string parameterName)
        => value ?? throw new ArgumentNullException(parameterName);

    private static bool ContainsValue(IEnumerable<string> values, string expectedValue)
    {
        foreach (var value in values)
        {
            if (string.Equals(value, expectedValue, StringComparison.Ordinal))
            {
                return true;
            }
        }

        return false;
    }

    private static void ValidateHeaderName(string? name)
    {
        if (name is null)
        {
            throw new ArgumentNullException(nameof(name));
        }

        if (name.Length == 0)
        {
            throw new ArgumentException("An HTTP header name cannot be empty.", nameof(name));
        }

        foreach (var character in name)
        {
            var isAsciiLetterOrDigit = character is >= 'a' and <= 'z'
                or >= 'A' and <= 'Z'
                or >= '0' and <= '9';
            var isTokenPunctuation = "!#$%&'*+-.^_`|~".IndexOf(character) >= 0;
            if (!isAsciiLetterOrDigit && !isTokenPunctuation)
            {
                throw new ArgumentException("An HTTP header name must contain only token characters.", nameof(name));
            }
        }
    }

    private HttpResponseMessage RequireSubject()
        => Subject ?? throw new AstraFlowAssertionException("Expected a non-null HTTP response message.");
}
