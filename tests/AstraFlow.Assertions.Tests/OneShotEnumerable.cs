using System.Collections;
using System.Collections.Generic;

namespace AstraFlow.Assertions.Tests;

internal sealed class OneShotEnumerable<T> : IEnumerable<T>
{
    private readonly IEnumerable<T> _items;

    public OneShotEnumerable(
        IEnumerable<T> items,
        Exception? moveNextException = null,
        Exception? currentException = null,
        Exception? disposeException = null)
    {
        _items = items;
        MoveNextException = moveNextException;
        CurrentException = currentException;
        DisposeException = disposeException;
    }

    public Exception? MoveNextException { get; }

    public Exception? CurrentException { get; }

    public Exception? DisposeException { get; }

    public int GetEnumeratorCalls { get; private set; }

    public int MoveNextCalls { get; private set; }

    public int DisposeCalls { get; private set; }

    public IEnumerator<T> GetEnumerator()
    {
        GetEnumeratorCalls++;
        if (GetEnumeratorCalls > 1)
        {
            throw new InvalidOperationException("The sequence can only be enumerated once.");
        }

        return new OneShotEnumerator(this, _items.GetEnumerator());
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();

    private sealed class OneShotEnumerator : IEnumerator<T>
    {
        private readonly OneShotEnumerable<T> _owner;
        private readonly IEnumerator<T> _inner;

        public OneShotEnumerator(OneShotEnumerable<T> owner, IEnumerator<T> inner)
        {
            _owner = owner;
            _inner = inner;
        }

        public T Current
        {
            get
            {
                if (_owner.CurrentException is not null)
                {
                    throw _owner.CurrentException;
                }

                return _inner.Current;
            }
        }

        object? IEnumerator.Current => Current;

        public bool MoveNext()
        {
            _owner.MoveNextCalls++;
            if (_owner.MoveNextException is not null)
            {
                throw _owner.MoveNextException;
            }

            return _inner.MoveNext();
        }

        public void Reset() => throw new NotSupportedException();

        public void Dispose()
        {
            _owner.DisposeCalls++;
            _inner.Dispose();
            if (_owner.DisposeException is not null)
            {
                throw _owner.DisposeException;
            }
        }
    }
}
