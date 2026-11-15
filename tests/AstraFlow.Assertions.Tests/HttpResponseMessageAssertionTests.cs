using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class HttpResponseMessageAssertionTests
{
    [Fact]
    public void HttpResponseAssertions_CheckStatusAndSuccessRange()
    {
        using var successful = new HttpResponseMessage(HttpStatusCode.Created);
        using var unsuccessful = new HttpResponseMessage(HttpStatusCode.Conflict);

        var successfulAssertions = successful.Should();
        var unsuccessfulAssertions = unsuccessful.Should();
        Assert.Same(successfulAssertions, successfulAssertions.HaveStatusCode(HttpStatusCode.Created).BeSuccessful());
        Assert.Same(unsuccessfulAssertions, unsuccessfulAssertions.NotHaveStatusCode(HttpStatusCode.OK).NotBeSuccessful());
        Assert.Throws<AstraFlowAssertionException>(() => successful.Should().NotHaveStatusCode(HttpStatusCode.Created));
        Assert.Throws<AstraFlowAssertionException>(() => unsuccessful.Should().HaveStatusCode(HttpStatusCode.OK));
        Assert.Throws<AstraFlowAssertionException>(() => unsuccessful.Should().BeSuccessful());
        Assert.Throws<AstraFlowAssertionException>(() => successful.Should().NotBeSuccessful());
    }

    [Fact]
    public void HttpResponseAssertions_CheckResponseHeaderNamesAndExactValues()
    {
        using var response = new HttpResponseMessage(HttpStatusCode.OK);
        response.Headers.TryAddWithoutValidation("X-Trace", "trace-secret");
        response.Headers.TryAddWithoutValidation("X-Trace", "second-value");

        response.Should()
            .HaveResponseHeader("x-trace")
            .HaveResponseHeaderValue("X-Trace", "trace-secret")
            .NotHaveResponseHeaderValue("X-Trace", "other-value")
            .NotHaveResponseHeader("X-Missing");

        Assert.Throws<AstraFlowAssertionException>(() => response.Should().NotHaveResponseHeader("X-Trace"));
        Assert.Throws<AstraFlowAssertionException>(() => response.Should().HaveResponseHeaderValue("X-Trace", "TRACE-SECRET"));
        Assert.Throws<AstraFlowAssertionException>(() => response.Should().NotHaveResponseHeaderValue("X-Trace", "second-value"));
        Assert.Throws<AstraFlowAssertionException>(() => response.Should().HaveResponseHeader("X-Missing"));
    }

    [Fact]
    public void HttpResponseAssertions_CheckContentHeadersWithoutReadingOrDisposingContent()
    {
        using var response = new HttpResponseMessage(HttpStatusCode.OK);
        var content = new TrackingContent();
        content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        content.Headers.Add("X-Content-Metadata", "metadata-secret");
        response.Content = content;

        response.Should()
            .HaveContentHeader("content-type")
            .HaveContentHeaderValue("Content-Type", "application/json")
            .HaveContentHeaderValue("X-Content-Metadata", "metadata-secret")
            .NotHaveContentHeader("X-Missing")
            .NotHaveContentHeaderValue("X-Content-Metadata", "different");

        Assert.Equal(0, content.SerializationCount);
        Assert.Same(content, response.Content);
    }

    [Fact]
    public void HttpResponseAssertions_FailureMessagesDoNotExposeHeaderValuesBodyOrRequestUri()
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "https://example.test/private-path?token=request-secret");
        using var response = new HttpResponseMessage(HttpStatusCode.BadRequest)
        {
            RequestMessage = request,
            Content = new StringContent("body-secret")
        };
        response.Headers.TryAddWithoutValidation("X-Private", "response-secret");

        var headerFailure = Assert.Throws<AstraFlowAssertionException>(
            () => response.Should().HaveResponseHeaderValue("X-Private", "expected-secret"));
        var statusFailure = Assert.Throws<AstraFlowAssertionException>(() => response.Should().BeSuccessful());

        Assert.DoesNotContain("response-secret", headerFailure.Message, System.StringComparison.Ordinal);
        Assert.DoesNotContain("expected-secret", headerFailure.Message, System.StringComparison.Ordinal);
        Assert.DoesNotContain("body-secret", headerFailure.Message, System.StringComparison.Ordinal);
        Assert.DoesNotContain("request-secret", statusFailure.Message, System.StringComparison.Ordinal);
        Assert.DoesNotContain("private-path", statusFailure.Message, System.StringComparison.Ordinal);
    }

    [Fact]
    public async Task HttpResponseAssertions_ReadAndCompareTextWithoutDisposingContent()
    {
        using var response = new HttpResponseMessage(HttpStatusCode.OK);
        var content = new TrackingContent("private response body with visible marker");
        response.Content = content;
        var assertions = response.Should();

        Assert.Same(assertions, await assertions.HaveContentAsync("private response body with visible marker"));
        Assert.Same(assertions, await assertions.NotHaveContentAsync("different body"));
        Assert.Same(assertions, await assertions.ContainContentAsync("visible marker"));
        Assert.Same(assertions, await assertions.NotContainContentAsync("missing marker"));

        Assert.Equal(1, content.SerializationCount);
        Assert.False(content.IsDisposed);
        Assert.Same(content, response.Content);
    }

    [Fact]
    public async Task HttpResponseAssertions_TextFailuresDoNotExposeExpectedOrActualContent()
    {
        using var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("actual-body-secret")
        };

        var exactFailure = await Assert.ThrowsAsync<AstraFlowAssertionException>(
            () => response.Should().HaveContentAsync("expected-body-secret"));
        var containsFailure = await Assert.ThrowsAsync<AstraFlowAssertionException>(
            () => response.Should().ContainContentAsync("expected-fragment-secret"));
        var negativeFailure = await Assert.ThrowsAsync<AstraFlowAssertionException>(
            () => response.Should().NotContainContentAsync("actual-body-secret"));

        Assert.DoesNotContain("actual-body-secret", exactFailure.Message, System.StringComparison.Ordinal);
        Assert.DoesNotContain("expected-body-secret", exactFailure.Message, System.StringComparison.Ordinal);
        Assert.DoesNotContain("expected-fragment-secret", containsFailure.Message, System.StringComparison.Ordinal);
        Assert.DoesNotContain("actual-body-secret", negativeFailure.Message, System.StringComparison.Ordinal);
    }

    [Fact]
    public async Task HttpResponseAssertions_TextChecksTreatMissingContentAsEmptyAndRejectNullExpectedText()
    {
        using var response = new HttpResponseMessage(HttpStatusCode.NoContent)
        {
            Content = null
        };

        await response.Should().HaveContentAsync(string.Empty);
        await response.Should().NotContainContentAsync("text");
        await Assert.ThrowsAsync<System.ArgumentNullException>(
            () => response.Should().HaveContentAsync(null!));
    }

    [Fact]
    public void HttpResponseAssertions_RejectNullSubjectsAndInvalidArguments()
    {
        HttpResponseMessage? missing = null;
        using var response = new HttpResponseMessage(HttpStatusCode.OK);

        Assert.Throws<AstraFlowAssertionException>(() => missing.Should().BeSuccessful());
        Assert.Throws<ArgumentException>(() => response.Should().HaveResponseHeader(string.Empty));
        Assert.Throws<ArgumentException>(() => response.Should().HaveContentHeader("X-Invalid\r\nHeader"));
        Assert.Throws<System.ArgumentNullException>(() => response.Should().HaveResponseHeaderValue("X-Test", null!));
        Assert.Throws<System.ArgumentNullException>(() => response.Should().HaveContentHeaderValue("X-Test", null!));
    }

    private sealed class TrackingContent : HttpContent
    {
        private readonly byte[] _bytes;

        public TrackingContent(string text = "") => _bytes = Encoding.UTF8.GetBytes(text);

        public int SerializationCount { get; private set; }

        public bool IsDisposed { get; private set; }

        protected override Task SerializeToStreamAsync(Stream stream, System.Net.TransportContext? context)
        {
            SerializationCount++;
            return stream.WriteAsync(_bytes, 0, _bytes.Length);
        }

        protected override void Dispose(bool disposing)
        {
            IsDisposed = true;
            base.Dispose(disposing);
        }

        protected override bool TryComputeLength(out long length)
        {
            length = 0;
            return true;
        }
    }
}
