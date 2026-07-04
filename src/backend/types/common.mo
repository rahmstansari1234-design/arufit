module {
  /// Unix timestamp in nanoseconds (from Time.now())
  public type Timestamp = Int;

  /// Paginated result wrapper
  public type Page<T> = {
    items : [T];
    nextCursor : ?Text;
    hasMore : Bool;
  };
};
