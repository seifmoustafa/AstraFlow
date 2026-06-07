using AstraFlow.Mediator;

namespace SharedContractsCompatibilitySample;

public sealed record SharedLookup(string Key) : IRequest<SharedLookupResult>;

public sealed record SharedLookupResult(string Key, string Value);

public sealed record SharedLookupObserved(string Key) : INotification;
