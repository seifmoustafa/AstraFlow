using AstraFlow.Security;
using FluentAssertions;
using Xunit;

namespace AstraFlow.Security.Tests;

public sealed class AstraFlowSecurityPolicyTests
{
    [Theory]
    [InlineData("Password")]
    [InlineData("api_key")]
    [InlineData("ConnectionString")]
    [InlineData("recovery-code")]
    [InlineData("user.credentials.token")]
    [InlineData("privateKeyPem")]
    public void SensitivePolicy_ClassifiesDefaultSensitiveNames(string name)
    {
        var policy = new AstraFlowSensitiveDataPolicy();

        policy.IsSensitiveName(name).Should().BeTrue();
    }

    [Theory]
    [InlineData("DisplayName")]
    [InlineData("TenantId")]
    [InlineData("PublicId")]
    [InlineData("monkeyBusiness")]
    public void SensitivePolicy_DoesNotClassifyRoutineNames(string name)
    {
        var policy = new AstraFlowSensitiveDataPolicy();

        policy.IsSensitiveName(name).Should().BeFalse();
    }

    [Fact]
    public void RedactionPolicy_RedactsSensitiveValues()
    {
        var policy = new AstraFlowRedactionPolicy();

        policy.RedactValue("AccessToken", "secret-value").Should().Be(AstraFlowRedactionPolicy.DefaultRedactedValue);
    }

    [Fact]
    public void RedactionPolicy_ReturnsNonSensitiveValues()
    {
        var policy = new AstraFlowRedactionPolicy();

        policy.RedactValue("OperationName", "AstraFlow.Mediator.Ping").Should().Be("AstraFlow.Mediator.Ping");
    }

    [Fact]
    public void RedactionPolicy_SupportsCustomTaxonomyAndReplacement()
    {
        var policy = new AstraFlowRedactionPolicy(
            new AstraFlowSensitiveDataPolicy(["internal"]),
            "<hidden>");

        policy.RedactValue("InternalNote", "review-only").Should().Be("<hidden>");
        policy.RedactValue("DisplayName", "Alpha").Should().Be("Alpha");
    }
}
