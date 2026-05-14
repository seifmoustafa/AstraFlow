using AstraFlow.Mediator;

namespace AstraFlow.Testing;

internal static class RuntimeRequestContract
{
    internal static bool IsVoidRequest(object request)
    {
        if (request is null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        return typeof(IRequest).IsAssignableFrom(request.GetType());
    }

    internal static Type GetSingleResponseType(object request)
    {
        if (request is null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        var requestInterfaces = request
            .GetType()
            .GetInterfaces()
            .Where(type => type.IsGenericType && type.GetGenericTypeDefinition() == typeof(IRequest<>))
            .ToArray();

        if (requestInterfaces.Length == 0)
        {
            throw new InvalidOperationException(
                $"Request type '{request.GetType().FullName}' must implement IRequest<TResponse>.");
        }

        if (requestInterfaces.Length > 1)
        {
            var contracts = string.Join(", ", requestInterfaces.Select(type => type.FullName).ToArray());
            throw new InvalidOperationException(
                $"Request type '{request.GetType().FullName}' implements multiple IRequest<TResponse> contracts: {contracts}.");
        }

        return requestInterfaces[0].GetGenericArguments()[0];
    }

    internal static Type GetSingleStreamResponseType(object request)
    {
        if (request is null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        var requestInterfaces = request
            .GetType()
            .GetInterfaces()
            .Where(type => type.IsGenericType && type.GetGenericTypeDefinition() == typeof(IStreamRequest<>))
            .ToArray();

        if (requestInterfaces.Length == 0)
        {
            throw new InvalidOperationException(
                $"Request type '{request.GetType().FullName}' must implement IStreamRequest<TResponse>.");
        }

        if (requestInterfaces.Length > 1)
        {
            var contracts = string.Join(", ", requestInterfaces.Select(type => type.FullName).ToArray());
            throw new InvalidOperationException(
                $"Request type '{request.GetType().FullName}' implements multiple IStreamRequest<TResponse> contracts: {contracts}.");
        }

        return requestInterfaces[0].GetGenericArguments()[0];
    }
}
