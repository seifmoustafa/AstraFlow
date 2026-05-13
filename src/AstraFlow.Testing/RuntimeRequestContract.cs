using AstraFlow.Mediator;

namespace AstraFlow.Testing;

internal static class RuntimeRequestContract
{
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
}
