using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace AstraFlow.Assertions.Tests;

internal sealed class OneShotAsyncEnumerable<T> : IAsyncEnumerable<T>
{
    private readonly IReadOnlyList<T> _items;

    public OneShotAsyncEnumerable(IReadOnlyList<T> items, Exception? moveNextException = null)
    {
        _items = items;
        MoveNextException = moveNextException;
    }

    public Exception? MoveNextException { get; }

    public int GetAsyncEnumeratorCalls { get; private set; }

    public int MoveNextCalls { get; private set; }

    public int DisposeAsyncCalls { get; private set; }

    public CancellationToken ReceivedCancellationToken { get; private set; }

    public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
    {
        GetAsyncEnumeratorCalls++;
        if (GetAsyncEnumeratorCalls > 1)
        {
            throw new InvalidOperationException("The sequence can only be enumerated once.");
        }

        ReceivedCancellationToken = cancellationToken;
        return new Enumerator(this, cancellationToken);
    }

    private sealed class Enumerator : IAsyncEnumerator<T>
    {
        private readonly OneShotAsyncEnumerable<T> _owner;
        private readonly CancellationToken _cancellationToken;
        private int _index = -1;

        public Enumerator(OneShotAsyncEnumerable<T> owner, CancellationToken cancellationToken)
        {
            _owner = owner;
            _cancellationToken = cancellationToken;
        }

        public T Current => _owner._items[_index];

        public ValueTask<bool> MoveNextAsync()
        {
            _owner.MoveNextCalls++;
            if (_owner.MoveNextException is not null)
            {
                return ValueTask.FromException<bool>(_owner.MoveNextException);
            }

            if (_cancellationToken.IsCancellationRequested)
            {
                return ValueTask.FromCanceled<bool>(_cancellationToken);
            }

            _index++;
            return new ValueTask<bool>(_index < _owner._items.Count);
        }

        public ValueTask DisposeAsync()
        {
            _owner.DisposeAsyncCalls++;
            return default;
        }
    }
}
