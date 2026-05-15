namespace AstraFlow.Testing;

/// <summary>
/// Framework-neutral exception assertions for AstraFlow tests.
/// </summary>
public static class ExceptionAssertions
{
    /// <summary>
    /// Asserts that an asynchronous operation throws the expected exception type.
    /// </summary>
    /// <typeparam name="TException">The expected exception type.</typeparam>
    /// <param name="operation">The operation under test.</param>
    /// <returns>The thrown exception.</returns>
    public static async Task<TException> ShouldThrowAsync<TException>(Func<Task> operation)
        where TException : Exception
    {
        if (operation is null)
        {
            throw new ArgumentNullException(nameof(operation));
        }

        try
        {
            await operation().ConfigureAwait(false);
        }
        catch (TException exception)
        {
            return exception;
        }
        catch (Exception exception)
        {
            throw new AstraFlowAssertionException(
                $"Expected exception '{typeof(TException).FullName}', but caught '{exception.GetType().FullName}': {exception.Message}");
        }

        throw new AstraFlowAssertionException(
            $"Expected exception '{typeof(TException).FullName}', but no exception was thrown.");
    }
}
