# v1.6.2 Inheritance And Polymorphism Design Note

Status: `Implemented candidate`.

This note promotes the next `v1.6.x` candidate follow-ups from the roadmap:

- Inheritance mapping after profile/catalog model stabilizes.
- Polymorphic mapping after profile/catalog model stabilizes.

Collection element polymorphism remains out of scope for this release.

## Scope

`v1.6.2` adds explicit convention-mapping APIs:

- `IncludeBase<TBaseSource, TBaseDestination>()` on a derived mapping pair.
- `IncludeDerived<TDerivedSource, TDerivedDestination>()` on a base mapping pair.

`IncludeBase` records an inheritance relationship for diagnostics and validation. Inherited public properties still map through normal convention member matching.

`IncludeDerived` registers a derived mapping pair and allows polymorphic dispatch when the caller maps a derived source instance through the base destination type.

## Diagnostics

The implementation must report inheritance and polymorphic decisions without payload values:

- `AFC017`: a mapping pair includes a base mapping pair.
- `AFC018`: a mapping pair includes a derived mapping pair for polymorphic dispatch.
- `AFC019`: a mapping operation used a derived convention mapping for a base destination request.

## Safety Rules

- Inheritance and polymorphic mapping are opt-in per mapping pair.
- Registering `TDestination` as the base destination never creates reverse maps or domain writes.
- Polymorphic dispatch only considers derived pairs declared from `IncludeDerived`.
- Collection element polymorphism remains out of scope.
- Hidden global type hierarchy scanning is not allowed.

## Tests

`v1.6.2` requires tests for:

- derived mappings with `IncludeBase` and `AFC017`,
- base mappings with `IncludeDerived` and `AFC018`,
- runtime polymorphic dispatch to a derived destination and `AFC019`,
- no polymorphic dispatch when derived mappings are not explicitly included.
