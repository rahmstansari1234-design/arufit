var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _client, _currentQuery, _currentQueryInitialState, _currentResult, _currentResultState, _currentResultOptions, _currentThenable, _selectError, _selectFn, _selectResult, _lastQueryWithDefinedData, _staleTimeoutId, _refetchIntervalId, _currentRefetchInterval, _trackedProps, _QueryObserver_instances, executeFetch_fn, updateStaleTimeout_fn, computeRefetchInterval_fn, updateRefetchInterval_fn, updateTimers_fn, clearStaleTimeout_fn, clearRefetchInterval_fn, updateQuery_fn, notify_fn, _a, _client2, _currentResult2, _currentMutation, _mutateOptions, _MutationObserver_instances, updateResult_fn, notify_fn2, _b;
import { P as ProtocolError, T as TimeoutWaitingForResponseErrorCode, d as utf8ToBytes, E as ExternalError, e as MissingRootKeyErrorCode, C as Certificate, l as lookupResultToBuffer, R as RequestStatusResponseStatus, f as UnknownError, g as RequestStatusDoneNoReplyErrorCode, h as RejectError, i as CertifiedRejectErrorCode, k as UNREACHABLE_ERROR, I as InputError, m as InvalidReadStateRequestErrorCode, n as ReadRequestType, o as Principal, p as IDL, q as MissingCanisterIdErrorCode, H as HttpAgent, s as encode, Q as QueryResponseStatus, t as UncertifiedRejectErrorCode, v as isV3ResponseBody, w as isV2ResponseBody, x as UncertifiedRejectUpdateErrorCode, y as UnexpectedErrorCode, z as decode, A as Subscribable, D as pendingThenable, F as resolveEnabled, G as shallowEqualObjects, J as resolveStaleTime, K as noop, N as environmentManager, O as isValidTimeout, V as timeUntilStale, W as timeoutManager, X as focusManager, Y as fetchState, Z as replaceData, _ as notifyManager, $ as hashKey, a0 as getDefaultState, r as reactExports, a1 as shouldThrowError, a2 as useQueryClient, b as useInternetIdentity, a3 as createActorWithConfig, a4 as Record, a5 as Opt, a6 as Vec, a7 as Variant, a8 as Tuple, a9 as Principal$1, aa as Text, ab as Service, ac as Func, ad as Bool, ae as Nat, af as Int, ag as Null } from "./index-BBmdRvnk.js";
const FIVE_MINUTES_IN_MSEC = 5 * 60 * 1e3;
function defaultStrategy() {
  return chain(conditionalDelay(once(), 1e3), backoff(1e3, 1.2), timeout(FIVE_MINUTES_IN_MSEC));
}
function once() {
  let first = true;
  return async () => {
    if (first) {
      first = false;
      return true;
    }
    return false;
  };
}
function conditionalDelay(condition, timeInMsec) {
  return async (canisterId, requestId, status) => {
    if (await condition(canisterId, requestId, status)) {
      return new Promise((resolve) => setTimeout(resolve, timeInMsec));
    }
  };
}
function timeout(timeInMsec) {
  const end = Date.now() + timeInMsec;
  return async (_canisterId, requestId, status) => {
    if (Date.now() > end) {
      throw ProtocolError.fromCode(new TimeoutWaitingForResponseErrorCode(`Request timed out after ${timeInMsec} msec`, requestId, status));
    }
  };
}
function backoff(startingThrottleInMsec, backoffFactor) {
  let currentThrottling = startingThrottleInMsec;
  return () => new Promise((resolve) => setTimeout(() => {
    currentThrottling *= backoffFactor;
    resolve();
  }, currentThrottling));
}
function chain(...strategies) {
  return async (canisterId, requestId, status) => {
    for (const a of strategies) {
      await a(canisterId, requestId, status);
    }
  };
}
const DEFAULT_POLLING_OPTIONS = {
  preSignReadStateRequest: false
};
function hasProperty(value, property) {
  return Object.prototype.hasOwnProperty.call(value, property);
}
function isObjectWithProperty(value, property) {
  return value !== null && typeof value === "object" && hasProperty(value, property);
}
function hasFunction(value, property) {
  return hasProperty(value, property) && typeof value[property] === "function";
}
function isSignedReadStateRequestWithExpiry(value) {
  return isObjectWithProperty(value, "body") && isObjectWithProperty(value.body, "content") && value.body.content.request_type === ReadRequestType.ReadState && isObjectWithProperty(value.body.content, "ingress_expiry") && typeof value.body.content.ingress_expiry === "object" && value.body.content.ingress_expiry !== null && hasFunction(value.body.content.ingress_expiry, "toHash");
}
async function pollForResponse(agent, canisterId, requestId, options = {}) {
  const path = [utf8ToBytes("request_status"), requestId];
  let state;
  let currentRequest;
  const preSignReadStateRequest = options.preSignReadStateRequest ?? false;
  if (preSignReadStateRequest) {
    currentRequest = await constructRequest({
      paths: [path],
      agent,
      pollingOptions: options
    });
    state = await agent.readState(canisterId, { paths: [path] }, void 0, currentRequest);
  } else {
    state = await agent.readState(canisterId, { paths: [path] });
  }
  if (agent.rootKey == null) {
    throw ExternalError.fromCode(new MissingRootKeyErrorCode());
  }
  const cert = await Certificate.create({
    certificate: state.certificate,
    rootKey: agent.rootKey,
    canisterId,
    blsVerify: options.blsVerify,
    agent
  });
  const maybeBuf = lookupResultToBuffer(cert.lookup_path([...path, utf8ToBytes("status")]));
  let status;
  if (typeof maybeBuf === "undefined") {
    status = RequestStatusResponseStatus.Unknown;
  } else {
    status = new TextDecoder().decode(maybeBuf);
  }
  switch (status) {
    case RequestStatusResponseStatus.Replied: {
      return {
        reply: lookupResultToBuffer(cert.lookup_path([...path, "reply"])),
        certificate: cert
      };
    }
    case RequestStatusResponseStatus.Received:
    case RequestStatusResponseStatus.Unknown:
    case RequestStatusResponseStatus.Processing: {
      const strategy = options.strategy ?? defaultStrategy();
      await strategy(canisterId, requestId, status);
      return pollForResponse(agent, canisterId, requestId, {
        ...options,
        // Pass over either the strategy already provided or the new one created above
        strategy,
        request: currentRequest
      });
    }
    case RequestStatusResponseStatus.Rejected: {
      const rejectCode = new Uint8Array(lookupResultToBuffer(cert.lookup_path([...path, "reject_code"])))[0];
      const rejectMessage = new TextDecoder().decode(lookupResultToBuffer(cert.lookup_path([...path, "reject_message"])));
      const errorCodeBuf = lookupResultToBuffer(cert.lookup_path([...path, "error_code"]));
      const errorCode = errorCodeBuf ? new TextDecoder().decode(errorCodeBuf) : void 0;
      throw RejectError.fromCode(new CertifiedRejectErrorCode(requestId, rejectCode, rejectMessage, errorCode));
    }
    case RequestStatusResponseStatus.Done:
      throw UnknownError.fromCode(new RequestStatusDoneNoReplyErrorCode(requestId));
  }
  throw UNREACHABLE_ERROR;
}
async function constructRequest(options) {
  var _a2;
  const { paths, agent, pollingOptions } = options;
  if (pollingOptions.request && isSignedReadStateRequestWithExpiry(pollingOptions.request)) {
    return pollingOptions.request;
  }
  const request = await ((_a2 = agent.createReadStateRequest) == null ? void 0 : _a2.call(agent, {
    paths
  }, void 0));
  if (!isSignedReadStateRequestWithExpiry(request)) {
    throw InputError.fromCode(new InvalidReadStateRequestErrorCode(request));
  }
  return request;
}
const metadataSymbol = Symbol.for("ic-agent-metadata");
class Actor {
  /**
   * Get the Agent class this Actor would call, or undefined if the Actor would use
   * the default agent (global.ic.agent).
   * @param actor The actor to get the agent of.
   */
  static agentOf(actor) {
    return actor[metadataSymbol].config.agent;
  }
  /**
   * Get the interface of an actor, in the form of an instance of a Service.
   * @param actor The actor to get the interface of.
   */
  static interfaceOf(actor) {
    return actor[metadataSymbol].service;
  }
  static canisterIdOf(actor) {
    return Principal.from(actor[metadataSymbol].config.canisterId);
  }
  static createActorClass(interfaceFactory, options) {
    const service = interfaceFactory({ IDL });
    class CanisterActor extends Actor {
      constructor(config) {
        if (!config.canisterId) {
          throw InputError.fromCode(new MissingCanisterIdErrorCode(config.canisterId));
        }
        const canisterId = typeof config.canisterId === "string" ? Principal.fromText(config.canisterId) : config.canisterId;
        super({
          config: {
            ...DEFAULT_ACTOR_CONFIG,
            ...config,
            canisterId
          },
          service
        });
        for (const [methodName, func] of service._fields) {
          if (options == null ? void 0 : options.httpDetails) {
            func.annotations.push(ACTOR_METHOD_WITH_HTTP_DETAILS);
          }
          if (options == null ? void 0 : options.certificate) {
            func.annotations.push(ACTOR_METHOD_WITH_CERTIFICATE);
          }
          this[methodName] = _createActorMethod(this, methodName, func, config.blsVerify);
        }
      }
    }
    return CanisterActor;
  }
  /**
   * Creates an actor with the given interface factory and configuration.
   *
   * The [`@icp-sdk/bindgen`](https://js.icp.build/bindgen/) package can be used to generate the interface factory for your canister.
   * @param interfaceFactory - the interface factory for the actor, typically generated by the [`@icp-sdk/bindgen`](https://js.icp.build/bindgen/) package
   * @param configuration - the configuration for the actor
   * @returns an actor with the given interface factory and configuration
   * @example
   * Using the interface factory generated by the [`@icp-sdk/bindgen`](https://js.icp.build/bindgen/) package:
   * ```ts
   * import { Actor, HttpAgent } from '@icp-sdk/core/agent';
   * import { Principal } from '@icp-sdk/core/principal';
   * import { idlFactory } from './api/declarations/hello-world.did';
   *
   * const canisterId = Principal.fromText('rrkah-fqaaa-aaaaa-aaaaq-cai');
   *
   * const agent = await HttpAgent.create({
   *   host: 'https://icp-api.io',
   * });
   *
   * const actor = Actor.createActor(idlFactory, {
   *   agent,
   *   canisterId,
   * });
   *
   * const response = await actor.greet('world');
   * console.log(response);
   * ```
   * @example
   * Using the `createActor` wrapper function generated by the [`@icp-sdk/bindgen`](https://js.icp.build/bindgen/) package:
   * ```ts
   * import { HttpAgent } from '@icp-sdk/core/agent';
   * import { Principal } from '@icp-sdk/core/principal';
   * import { createActor } from './api/hello-world';
   *
   * const canisterId = Principal.fromText('rrkah-fqaaa-aaaaa-aaaaq-cai');
   *
   * const agent = await HttpAgent.create({
   *   host: 'https://icp-api.io',
   * });
   *
   * const actor = createActor(canisterId, {
   *   agent,
   * });
   *
   * const response = await actor.greet('world');
   * console.log(response);
   * ```
   */
  static createActor(interfaceFactory, configuration) {
    if (!configuration.canisterId) {
      throw InputError.fromCode(new MissingCanisterIdErrorCode(configuration.canisterId));
    }
    return new (this.createActorClass(interfaceFactory))(configuration);
  }
  /**
   * Returns an actor with methods that return the http response details along with the result
   * @param interfaceFactory - the interface factory for the actor
   * @param configuration - the configuration for the actor
   * @deprecated - use createActor with actorClassOptions instead
   */
  static createActorWithHttpDetails(interfaceFactory, configuration) {
    return new (this.createActorClass(interfaceFactory, { httpDetails: true }))(configuration);
  }
  /**
   * Returns an actor with methods that return the http response details along with the result
   * @param interfaceFactory - the interface factory for the actor
   * @param configuration - the configuration for the actor
   * @param actorClassOptions - options for the actor class extended details to return with the result
   */
  static createActorWithExtendedDetails(interfaceFactory, configuration, actorClassOptions = {
    httpDetails: true,
    certificate: true
  }) {
    return new (this.createActorClass(interfaceFactory, actorClassOptions))(configuration);
  }
  constructor(metadata) {
    this[metadataSymbol] = Object.freeze(metadata);
  }
}
function decodeReturnValue(types, msg) {
  const returnValues = decode(types, msg);
  switch (returnValues.length) {
    case 0:
      return void 0;
    case 1:
      return returnValues[0];
    default:
      return returnValues;
  }
}
const DEFAULT_ACTOR_CONFIG = {
  pollingOptions: DEFAULT_POLLING_OPTIONS
};
const ACTOR_METHOD_WITH_HTTP_DETAILS = "http-details";
const ACTOR_METHOD_WITH_CERTIFICATE = "certificate";
function _createActorMethod(actor, methodName, func, blsVerify) {
  let caller;
  if (func.annotations.includes("query") || func.annotations.includes("composite_query")) {
    caller = async (options, ...args) => {
      var _a2, _b2;
      options = {
        ...options,
        ...(_b2 = (_a2 = actor[metadataSymbol].config).queryTransform) == null ? void 0 : _b2.call(_a2, methodName, args, {
          ...actor[metadataSymbol].config,
          ...options
        })
      };
      const agent = options.agent || actor[metadataSymbol].config.agent || new HttpAgent();
      const cid = Principal.from(options.canisterId || actor[metadataSymbol].config.canisterId);
      const arg = encode(func.argTypes, args);
      const result = await agent.query(cid, {
        methodName,
        arg,
        effectiveCanisterId: options.effectiveCanisterId
      });
      const httpDetails = {
        ...result.httpDetails,
        requestDetails: result.requestDetails
      };
      switch (result.status) {
        case QueryResponseStatus.Rejected: {
          const uncertifiedRejectErrorCode = new UncertifiedRejectErrorCode(result.requestId, result.reject_code, result.reject_message, result.error_code, result.signatures);
          uncertifiedRejectErrorCode.callContext = {
            canisterId: cid,
            methodName,
            httpDetails
          };
          throw RejectError.fromCode(uncertifiedRejectErrorCode);
        }
        case QueryResponseStatus.Replied:
          return func.annotations.includes(ACTOR_METHOD_WITH_HTTP_DETAILS) ? {
            httpDetails,
            result: decodeReturnValue(func.retTypes, result.reply.arg)
          } : decodeReturnValue(func.retTypes, result.reply.arg);
      }
    };
  } else {
    caller = async (options, ...args) => {
      var _a2, _b2;
      options = {
        ...options,
        ...(_b2 = (_a2 = actor[metadataSymbol].config).callTransform) == null ? void 0 : _b2.call(_a2, methodName, args, {
          ...actor[metadataSymbol].config,
          ...options
        })
      };
      const agent = options.agent || actor[metadataSymbol].config.agent || HttpAgent.createSync();
      const { canisterId, effectiveCanisterId, pollingOptions } = {
        ...DEFAULT_ACTOR_CONFIG,
        ...actor[metadataSymbol].config,
        ...options
      };
      const cid = Principal.from(canisterId);
      const ecid = effectiveCanisterId !== void 0 ? Principal.from(effectiveCanisterId) : cid;
      const arg = encode(func.argTypes, args);
      const { requestId, response, requestDetails } = await agent.call(cid, {
        methodName,
        arg,
        effectiveCanisterId: ecid,
        nonce: options.nonce
      });
      let reply;
      let certificate;
      if (isV3ResponseBody(response.body)) {
        if (agent.rootKey == null) {
          throw ExternalError.fromCode(new MissingRootKeyErrorCode());
        }
        const cert = response.body.certificate;
        certificate = await Certificate.create({
          certificate: cert,
          rootKey: agent.rootKey,
          canisterId: ecid,
          blsVerify,
          agent
        });
        const path = [utf8ToBytes("request_status"), requestId];
        const status = new TextDecoder().decode(lookupResultToBuffer(certificate.lookup_path([...path, "status"])));
        switch (status) {
          case "replied":
            reply = lookupResultToBuffer(certificate.lookup_path([...path, "reply"]));
            break;
          case "rejected": {
            const rejectCode = new Uint8Array(lookupResultToBuffer(certificate.lookup_path([...path, "reject_code"])))[0];
            const rejectMessage = new TextDecoder().decode(lookupResultToBuffer(certificate.lookup_path([...path, "reject_message"])));
            const error_code_buf = lookupResultToBuffer(certificate.lookup_path([...path, "error_code"]));
            const error_code = error_code_buf ? new TextDecoder().decode(error_code_buf) : void 0;
            const certifiedRejectErrorCode = new CertifiedRejectErrorCode(requestId, rejectCode, rejectMessage, error_code);
            certifiedRejectErrorCode.callContext = {
              canisterId: cid,
              methodName,
              httpDetails: response
            };
            throw RejectError.fromCode(certifiedRejectErrorCode);
          }
        }
      } else if (isV2ResponseBody(response.body)) {
        const { reject_code, reject_message, error_code } = response.body;
        const errorCode = new UncertifiedRejectUpdateErrorCode(requestId, reject_code, reject_message, error_code);
        errorCode.callContext = {
          canisterId: cid,
          methodName,
          httpDetails: response
        };
        throw RejectError.fromCode(errorCode);
      }
      if (response.status === 202) {
        const pollOptions = {
          ...pollingOptions,
          blsVerify
        };
        const response2 = await pollForResponse(agent, ecid, requestId, pollOptions);
        certificate = response2.certificate;
        reply = response2.reply;
      }
      const shouldIncludeHttpDetails = func.annotations.includes(ACTOR_METHOD_WITH_HTTP_DETAILS);
      const shouldIncludeCertificate = func.annotations.includes(ACTOR_METHOD_WITH_CERTIFICATE);
      const httpDetails = { ...response, requestDetails };
      if (reply !== void 0) {
        if (shouldIncludeHttpDetails && shouldIncludeCertificate) {
          return {
            httpDetails,
            certificate,
            result: decodeReturnValue(func.retTypes, reply)
          };
        } else if (shouldIncludeCertificate) {
          return {
            certificate,
            result: decodeReturnValue(func.retTypes, reply)
          };
        } else if (shouldIncludeHttpDetails) {
          return {
            httpDetails,
            result: decodeReturnValue(func.retTypes, reply)
          };
        }
        return decodeReturnValue(func.retTypes, reply);
      } else {
        const errorCode = new UnexpectedErrorCode(`Call was returned undefined. We cannot determine if the call was successful or not. Return types: [${func.retTypes.map((t) => t.display()).join(",")}].`);
        errorCode.callContext = {
          canisterId: cid,
          methodName,
          httpDetails
        };
        throw UnknownError.fromCode(errorCode);
      }
    };
  }
  const handler = (...args) => caller({}, ...args);
  handler.withOptions = (options) => (...args) => caller(options, ...args);
  return handler;
}
var QueryObserver = (_a = class extends Subscribable {
  constructor(client, options) {
    super();
    __privateAdd(this, _QueryObserver_instances);
    __privateAdd(this, _client);
    __privateAdd(this, _currentQuery);
    __privateAdd(this, _currentQueryInitialState);
    __privateAdd(this, _currentResult);
    __privateAdd(this, _currentResultState);
    __privateAdd(this, _currentResultOptions);
    __privateAdd(this, _currentThenable);
    __privateAdd(this, _selectError);
    __privateAdd(this, _selectFn);
    __privateAdd(this, _selectResult);
    // This property keeps track of the last query with defined data.
    // It will be used to pass the previous data and query to the placeholder function between renders.
    __privateAdd(this, _lastQueryWithDefinedData);
    __privateAdd(this, _staleTimeoutId);
    __privateAdd(this, _refetchIntervalId);
    __privateAdd(this, _currentRefetchInterval);
    __privateAdd(this, _trackedProps, /* @__PURE__ */ new Set());
    this.options = options;
    __privateSet(this, _client, client);
    __privateSet(this, _selectError, null);
    __privateSet(this, _currentThenable, pendingThenable());
    this.bindMethods();
    this.setOptions(options);
  }
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    if (this.listeners.size === 1) {
      __privateGet(this, _currentQuery).addObserver(this);
      if (shouldFetchOnMount(__privateGet(this, _currentQuery), this.options)) {
        __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
      } else {
        this.updateResult();
      }
      __privateMethod(this, _QueryObserver_instances, updateTimers_fn).call(this);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.destroy();
    }
  }
  shouldFetchOnReconnect() {
    return shouldFetchOn(
      __privateGet(this, _currentQuery),
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return shouldFetchOn(
      __privateGet(this, _currentQuery),
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set();
    __privateMethod(this, _QueryObserver_instances, clearStaleTimeout_fn).call(this);
    __privateMethod(this, _QueryObserver_instances, clearRefetchInterval_fn).call(this);
    __privateGet(this, _currentQuery).removeObserver(this);
  }
  setOptions(options) {
    const prevOptions = this.options;
    const prevQuery = __privateGet(this, _currentQuery);
    this.options = __privateGet(this, _client).defaultQueryOptions(options);
    if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== "boolean") {
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    }
    __privateMethod(this, _QueryObserver_instances, updateQuery_fn).call(this);
    __privateGet(this, _currentQuery).setOptions(this.options);
    if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) {
      __privateGet(this, _client).getQueryCache().notify({
        type: "observerOptionsUpdated",
        query: __privateGet(this, _currentQuery),
        observer: this
      });
    }
    const mounted = this.hasListeners();
    if (mounted && shouldFetchOptionally(
      __privateGet(this, _currentQuery),
      prevQuery,
      this.options,
      prevOptions
    )) {
      __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
    }
    this.updateResult();
    if (mounted && (__privateGet(this, _currentQuery) !== prevQuery || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== resolveEnabled(prevOptions.enabled, __privateGet(this, _currentQuery)) || resolveStaleTime(this.options.staleTime, __privateGet(this, _currentQuery)) !== resolveStaleTime(prevOptions.staleTime, __privateGet(this, _currentQuery)))) {
      __privateMethod(this, _QueryObserver_instances, updateStaleTimeout_fn).call(this);
    }
    const nextRefetchInterval = __privateMethod(this, _QueryObserver_instances, computeRefetchInterval_fn).call(this);
    if (mounted && (__privateGet(this, _currentQuery) !== prevQuery || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== resolveEnabled(prevOptions.enabled, __privateGet(this, _currentQuery)) || nextRefetchInterval !== __privateGet(this, _currentRefetchInterval))) {
      __privateMethod(this, _QueryObserver_instances, updateRefetchInterval_fn).call(this, nextRefetchInterval);
    }
  }
  getOptimisticResult(options) {
    const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), options);
    const result = this.createResult(query, options);
    if (shouldAssignObserverCurrentProperties(this, result)) {
      __privateSet(this, _currentResult, result);
      __privateSet(this, _currentResultOptions, this.options);
      __privateSet(this, _currentResultState, __privateGet(this, _currentQuery).state);
    }
    return result;
  }
  getCurrentResult() {
    return __privateGet(this, _currentResult);
  }
  trackResult(result, onPropTracked) {
    return new Proxy(result, {
      get: (target, key) => {
        this.trackProp(key);
        onPropTracked == null ? void 0 : onPropTracked(key);
        if (key === "promise") {
          this.trackProp("data");
          if (!this.options.experimental_prefetchInRender && __privateGet(this, _currentThenable).status === "pending") {
            __privateGet(this, _currentThenable).reject(
              new Error(
                "experimental_prefetchInRender feature flag is not enabled"
              )
            );
          }
        }
        return Reflect.get(target, key);
      }
    });
  }
  trackProp(key) {
    __privateGet(this, _trackedProps).add(key);
  }
  getCurrentQuery() {
    return __privateGet(this, _currentQuery);
  }
  refetch({ ...options } = {}) {
    return this.fetch({
      ...options
    });
  }
  fetchOptimistic(options) {
    const defaultedOptions = __privateGet(this, _client).defaultQueryOptions(options);
    const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), defaultedOptions);
    return query.fetch().then(() => this.createResult(query, defaultedOptions));
  }
  fetch(fetchOptions) {
    return __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this, {
      ...fetchOptions,
      cancelRefetch: fetchOptions.cancelRefetch ?? true
    }).then(() => {
      this.updateResult();
      return __privateGet(this, _currentResult);
    });
  }
  createResult(query, options) {
    var _a2;
    const prevQuery = __privateGet(this, _currentQuery);
    const prevOptions = this.options;
    const prevResult = __privateGet(this, _currentResult);
    const prevResultState = __privateGet(this, _currentResultState);
    const prevResultOptions = __privateGet(this, _currentResultOptions);
    const queryChange = query !== prevQuery;
    const queryInitialState = queryChange ? query.state : __privateGet(this, _currentQueryInitialState);
    const { state } = query;
    let newState = { ...state };
    let isPlaceholderData = false;
    let data;
    if (options._optimisticResults) {
      const mounted = this.hasListeners();
      const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
      const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
      if (fetchOnMount || fetchOptionally) {
        newState = {
          ...newState,
          ...fetchState(state.data, query.options)
        };
      }
      if (options._optimisticResults === "isRestoring") {
        newState.fetchStatus = "idle";
      }
    }
    let { error, errorUpdatedAt, status } = newState;
    data = newState.data;
    let skipSelect = false;
    if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
      let placeholderData;
      if ((prevResult == null ? void 0 : prevResult.isPlaceholderData) && options.placeholderData === (prevResultOptions == null ? void 0 : prevResultOptions.placeholderData)) {
        placeholderData = prevResult.data;
        skipSelect = true;
      } else {
        placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(
          (_a2 = __privateGet(this, _lastQueryWithDefinedData)) == null ? void 0 : _a2.state.data,
          __privateGet(this, _lastQueryWithDefinedData)
        ) : options.placeholderData;
      }
      if (placeholderData !== void 0) {
        status = "success";
        data = replaceData(
          prevResult == null ? void 0 : prevResult.data,
          placeholderData,
          options
        );
        isPlaceholderData = true;
      }
    }
    if (options.select && data !== void 0 && !skipSelect) {
      if (prevResult && data === (prevResultState == null ? void 0 : prevResultState.data) && options.select === __privateGet(this, _selectFn)) {
        data = __privateGet(this, _selectResult);
      } else {
        try {
          __privateSet(this, _selectFn, options.select);
          data = options.select(data);
          data = replaceData(prevResult == null ? void 0 : prevResult.data, data, options);
          __privateSet(this, _selectResult, data);
          __privateSet(this, _selectError, null);
        } catch (selectError) {
          __privateSet(this, _selectError, selectError);
        }
      }
    }
    if (__privateGet(this, _selectError)) {
      error = __privateGet(this, _selectError);
      data = __privateGet(this, _selectResult);
      errorUpdatedAt = Date.now();
      status = "error";
    }
    const isFetching = newState.fetchStatus === "fetching";
    const isPending = status === "pending";
    const isError = status === "error";
    const isLoading = isPending && isFetching;
    const hasData = data !== void 0;
    const result = {
      status,
      fetchStatus: newState.fetchStatus,
      isPending,
      isSuccess: status === "success",
      isError,
      isInitialLoading: isLoading,
      isLoading,
      data,
      dataUpdatedAt: newState.dataUpdatedAt,
      error,
      errorUpdatedAt,
      failureCount: newState.fetchFailureCount,
      failureReason: newState.fetchFailureReason,
      errorUpdateCount: newState.errorUpdateCount,
      isFetched: query.isFetched(),
      isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
      isFetching,
      isRefetching: isFetching && !isPending,
      isLoadingError: isError && !hasData,
      isPaused: newState.fetchStatus === "paused",
      isPlaceholderData,
      isRefetchError: isError && hasData,
      isStale: isStale(query, options),
      refetch: this.refetch,
      promise: __privateGet(this, _currentThenable),
      isEnabled: resolveEnabled(options.enabled, query) !== false
    };
    const nextResult = result;
    if (this.options.experimental_prefetchInRender) {
      const hasResultData = nextResult.data !== void 0;
      const isErrorWithoutData = nextResult.status === "error" && !hasResultData;
      const finalizeThenableIfPossible = (thenable) => {
        if (isErrorWithoutData) {
          thenable.reject(nextResult.error);
        } else if (hasResultData) {
          thenable.resolve(nextResult.data);
        }
      };
      const recreateThenable = () => {
        const pending = __privateSet(this, _currentThenable, nextResult.promise = pendingThenable());
        finalizeThenableIfPossible(pending);
      };
      const prevThenable = __privateGet(this, _currentThenable);
      switch (prevThenable.status) {
        case "pending":
          if (query.queryHash === prevQuery.queryHash) {
            finalizeThenableIfPossible(prevThenable);
          }
          break;
        case "fulfilled":
          if (isErrorWithoutData || nextResult.data !== prevThenable.value) {
            recreateThenable();
          }
          break;
        case "rejected":
          if (!isErrorWithoutData || nextResult.error !== prevThenable.reason) {
            recreateThenable();
          }
          break;
      }
    }
    return nextResult;
  }
  updateResult() {
    const prevResult = __privateGet(this, _currentResult);
    const nextResult = this.createResult(__privateGet(this, _currentQuery), this.options);
    __privateSet(this, _currentResultState, __privateGet(this, _currentQuery).state);
    __privateSet(this, _currentResultOptions, this.options);
    if (__privateGet(this, _currentResultState).data !== void 0) {
      __privateSet(this, _lastQueryWithDefinedData, __privateGet(this, _currentQuery));
    }
    if (shallowEqualObjects(nextResult, prevResult)) {
      return;
    }
    __privateSet(this, _currentResult, nextResult);
    const shouldNotifyListeners = () => {
      if (!prevResult) {
        return true;
      }
      const { notifyOnChangeProps } = this.options;
      const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
      if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !__privateGet(this, _trackedProps).size) {
        return true;
      }
      const includedProps = new Set(
        notifyOnChangePropsValue ?? __privateGet(this, _trackedProps)
      );
      if (this.options.throwOnError) {
        includedProps.add("error");
      }
      return Object.keys(__privateGet(this, _currentResult)).some((key) => {
        const typedKey = key;
        const changed = __privateGet(this, _currentResult)[typedKey] !== prevResult[typedKey];
        return changed && includedProps.has(typedKey);
      });
    };
    __privateMethod(this, _QueryObserver_instances, notify_fn).call(this, { listeners: shouldNotifyListeners() });
  }
  onQueryUpdate() {
    this.updateResult();
    if (this.hasListeners()) {
      __privateMethod(this, _QueryObserver_instances, updateTimers_fn).call(this);
    }
  }
}, _client = new WeakMap(), _currentQuery = new WeakMap(), _currentQueryInitialState = new WeakMap(), _currentResult = new WeakMap(), _currentResultState = new WeakMap(), _currentResultOptions = new WeakMap(), _currentThenable = new WeakMap(), _selectError = new WeakMap(), _selectFn = new WeakMap(), _selectResult = new WeakMap(), _lastQueryWithDefinedData = new WeakMap(), _staleTimeoutId = new WeakMap(), _refetchIntervalId = new WeakMap(), _currentRefetchInterval = new WeakMap(), _trackedProps = new WeakMap(), _QueryObserver_instances = new WeakSet(), executeFetch_fn = function(fetchOptions) {
  __privateMethod(this, _QueryObserver_instances, updateQuery_fn).call(this);
  let promise = __privateGet(this, _currentQuery).fetch(
    this.options,
    fetchOptions
  );
  if (!(fetchOptions == null ? void 0 : fetchOptions.throwOnError)) {
    promise = promise.catch(noop);
  }
  return promise;
}, updateStaleTimeout_fn = function() {
  __privateMethod(this, _QueryObserver_instances, clearStaleTimeout_fn).call(this);
  const staleTime = resolveStaleTime(
    this.options.staleTime,
    __privateGet(this, _currentQuery)
  );
  if (environmentManager.isServer() || __privateGet(this, _currentResult).isStale || !isValidTimeout(staleTime)) {
    return;
  }
  const time = timeUntilStale(__privateGet(this, _currentResult).dataUpdatedAt, staleTime);
  const timeout2 = time + 1;
  __privateSet(this, _staleTimeoutId, timeoutManager.setTimeout(() => {
    if (!__privateGet(this, _currentResult).isStale) {
      this.updateResult();
    }
  }, timeout2));
}, computeRefetchInterval_fn = function() {
  return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(__privateGet(this, _currentQuery)) : this.options.refetchInterval) ?? false;
}, updateRefetchInterval_fn = function(nextInterval) {
  __privateMethod(this, _QueryObserver_instances, clearRefetchInterval_fn).call(this);
  __privateSet(this, _currentRefetchInterval, nextInterval);
  if (environmentManager.isServer() || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) === false || !isValidTimeout(__privateGet(this, _currentRefetchInterval)) || __privateGet(this, _currentRefetchInterval) === 0) {
    return;
  }
  __privateSet(this, _refetchIntervalId, timeoutManager.setInterval(() => {
    if (this.options.refetchIntervalInBackground || focusManager.isFocused()) {
      __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
    }
  }, __privateGet(this, _currentRefetchInterval)));
}, updateTimers_fn = function() {
  __privateMethod(this, _QueryObserver_instances, updateStaleTimeout_fn).call(this);
  __privateMethod(this, _QueryObserver_instances, updateRefetchInterval_fn).call(this, __privateMethod(this, _QueryObserver_instances, computeRefetchInterval_fn).call(this));
}, clearStaleTimeout_fn = function() {
  if (__privateGet(this, _staleTimeoutId)) {
    timeoutManager.clearTimeout(__privateGet(this, _staleTimeoutId));
    __privateSet(this, _staleTimeoutId, void 0);
  }
}, clearRefetchInterval_fn = function() {
  if (__privateGet(this, _refetchIntervalId)) {
    timeoutManager.clearInterval(__privateGet(this, _refetchIntervalId));
    __privateSet(this, _refetchIntervalId, void 0);
  }
}, updateQuery_fn = function() {
  const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), this.options);
  if (query === __privateGet(this, _currentQuery)) {
    return;
  }
  const prevQuery = __privateGet(this, _currentQuery);
  __privateSet(this, _currentQuery, query);
  __privateSet(this, _currentQueryInitialState, query.state);
  if (this.hasListeners()) {
    prevQuery == null ? void 0 : prevQuery.removeObserver(this);
    query.addObserver(this);
  }
}, notify_fn = function(notifyOptions) {
  notifyManager.batch(() => {
    if (notifyOptions.listeners) {
      this.listeners.forEach((listener) => {
        listener(__privateGet(this, _currentResult));
      });
    }
    __privateGet(this, _client).getQueryCache().notify({
      query: __privateGet(this, _currentQuery),
      type: "observerResultsUpdated"
    });
  });
}, _a);
function shouldLoadOnMount(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && options.retryOnMount === false);
}
function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
  if (resolveEnabled(options.enabled, query) !== false && resolveStaleTime(options.staleTime, query) !== "static") {
    const value = typeof field === "function" ? field(query) : field;
    return value === "always" || value !== false && isStale(query, options);
  }
  return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return (query !== prevQuery || resolveEnabled(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.isStaleByTime(resolveStaleTime(options.staleTime, query));
}
function shouldAssignObserverCurrentProperties(observer, optimisticResult) {
  if (!shallowEqualObjects(observer.getCurrentResult(), optimisticResult)) {
    return true;
  }
  return false;
}
var MutationObserver = (_b = class extends Subscribable {
  constructor(client, options) {
    super();
    __privateAdd(this, _MutationObserver_instances);
    __privateAdd(this, _client2);
    __privateAdd(this, _currentResult2);
    __privateAdd(this, _currentMutation);
    __privateAdd(this, _mutateOptions);
    __privateSet(this, _client2, client);
    this.setOptions(options);
    this.bindMethods();
    __privateMethod(this, _MutationObserver_instances, updateResult_fn).call(this);
  }
  bindMethods() {
    this.mutate = this.mutate.bind(this);
    this.reset = this.reset.bind(this);
  }
  setOptions(options) {
    var _a2;
    const prevOptions = this.options;
    this.options = __privateGet(this, _client2).defaultMutationOptions(options);
    if (!shallowEqualObjects(this.options, prevOptions)) {
      __privateGet(this, _client2).getMutationCache().notify({
        type: "observerOptionsUpdated",
        mutation: __privateGet(this, _currentMutation),
        observer: this
      });
    }
    if ((prevOptions == null ? void 0 : prevOptions.mutationKey) && this.options.mutationKey && hashKey(prevOptions.mutationKey) !== hashKey(this.options.mutationKey)) {
      this.reset();
    } else if (((_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.state.status) === "pending") {
      __privateGet(this, _currentMutation).setOptions(this.options);
    }
  }
  onUnsubscribe() {
    var _a2;
    if (!this.hasListeners()) {
      (_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.removeObserver(this);
    }
  }
  onMutationUpdate(action) {
    __privateMethod(this, _MutationObserver_instances, updateResult_fn).call(this);
    __privateMethod(this, _MutationObserver_instances, notify_fn2).call(this, action);
  }
  getCurrentResult() {
    return __privateGet(this, _currentResult2);
  }
  reset() {
    var _a2;
    (_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.removeObserver(this);
    __privateSet(this, _currentMutation, void 0);
    __privateMethod(this, _MutationObserver_instances, updateResult_fn).call(this);
    __privateMethod(this, _MutationObserver_instances, notify_fn2).call(this);
  }
  mutate(variables, options) {
    var _a2;
    __privateSet(this, _mutateOptions, options);
    (_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.removeObserver(this);
    __privateSet(this, _currentMutation, __privateGet(this, _client2).getMutationCache().build(__privateGet(this, _client2), this.options));
    __privateGet(this, _currentMutation).addObserver(this);
    return __privateGet(this, _currentMutation).execute(variables);
  }
}, _client2 = new WeakMap(), _currentResult2 = new WeakMap(), _currentMutation = new WeakMap(), _mutateOptions = new WeakMap(), _MutationObserver_instances = new WeakSet(), updateResult_fn = function() {
  var _a2;
  const state = ((_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.state) ?? getDefaultState();
  __privateSet(this, _currentResult2, {
    ...state,
    isPending: state.status === "pending",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    isIdle: state.status === "idle",
    mutate: this.mutate,
    reset: this.reset
  });
}, notify_fn2 = function(action) {
  notifyManager.batch(() => {
    var _a2, _b2, _c, _d, _e, _f, _g, _h;
    if (__privateGet(this, _mutateOptions) && this.hasListeners()) {
      const variables = __privateGet(this, _currentResult2).variables;
      const onMutateResult = __privateGet(this, _currentResult2).context;
      const context = {
        client: __privateGet(this, _client2),
        meta: this.options.meta,
        mutationKey: this.options.mutationKey
      };
      if ((action == null ? void 0 : action.type) === "success") {
        try {
          (_b2 = (_a2 = __privateGet(this, _mutateOptions)).onSuccess) == null ? void 0 : _b2.call(
            _a2,
            action.data,
            variables,
            onMutateResult,
            context
          );
        } catch (e) {
          void Promise.reject(e);
        }
        try {
          (_d = (_c = __privateGet(this, _mutateOptions)).onSettled) == null ? void 0 : _d.call(
            _c,
            action.data,
            null,
            variables,
            onMutateResult,
            context
          );
        } catch (e) {
          void Promise.reject(e);
        }
      } else if ((action == null ? void 0 : action.type) === "error") {
        try {
          (_f = (_e = __privateGet(this, _mutateOptions)).onError) == null ? void 0 : _f.call(
            _e,
            action.error,
            variables,
            onMutateResult,
            context
          );
        } catch (e) {
          void Promise.reject(e);
        }
        try {
          (_h = (_g = __privateGet(this, _mutateOptions)).onSettled) == null ? void 0 : _h.call(
            _g,
            void 0,
            action.error,
            variables,
            onMutateResult,
            context
          );
        } catch (e) {
          void Promise.reject(e);
        }
      }
    }
    this.listeners.forEach((listener) => {
      listener(__privateGet(this, _currentResult2));
    });
  });
}, _b);
var IsRestoringContext = reactExports.createContext(false);
var useIsRestoring = () => reactExports.useContext(IsRestoringContext);
IsRestoringContext.Provider;
function createValue() {
  let isReset = false;
  return {
    clearReset: () => {
      isReset = false;
    },
    reset: () => {
      isReset = true;
    },
    isReset: () => {
      return isReset;
    }
  };
}
var QueryErrorResetBoundaryContext = reactExports.createContext(createValue());
var useQueryErrorResetBoundary = () => reactExports.useContext(QueryErrorResetBoundaryContext);
var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary, query) => {
  const throwOnError = (query == null ? void 0 : query.state.error) && typeof options.throwOnError === "function" ? shouldThrowError(options.throwOnError, [query.state.error, query]) : options.throwOnError;
  if (options.suspense || options.experimental_prefetchInRender || throwOnError) {
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};
var useClearResetErrorBoundary = (errorResetBoundary) => {
  reactExports.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
var getHasError = ({
  result,
  errorResetBoundary,
  throwOnError,
  query,
  suspense
}) => {
  return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && result.data === void 0 || shouldThrowError(throwOnError, [result.error, query]));
};
var ensureSuspenseTimers = (defaultedOptions) => {
  if (defaultedOptions.suspense) {
    const MIN_SUSPENSE_TIME_MS = 1e3;
    const clamp = (value) => value === "static" ? value : Math.max(value ?? MIN_SUSPENSE_TIME_MS, MIN_SUSPENSE_TIME_MS);
    const originalStaleTime = defaultedOptions.staleTime;
    defaultedOptions.staleTime = typeof originalStaleTime === "function" ? (...args) => clamp(originalStaleTime(...args)) : clamp(originalStaleTime);
    if (typeof defaultedOptions.gcTime === "number") {
      defaultedOptions.gcTime = Math.max(
        defaultedOptions.gcTime,
        MIN_SUSPENSE_TIME_MS
      );
    }
  }
};
var willFetch = (result, isRestoring) => result.isLoading && result.isFetching && !isRestoring;
var shouldSuspend = (defaultedOptions, result) => (defaultedOptions == null ? void 0 : defaultedOptions.suspense) && result.isPending;
var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
  errorResetBoundary.clearReset();
});
function useBaseQuery(options, Observer, queryClient) {
  var _a2, _b2, _c, _d;
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const client = useQueryClient();
  const defaultedOptions = client.defaultQueryOptions(options);
  (_b2 = (_a2 = client.getDefaultOptions().queries) == null ? void 0 : _a2._experimental_beforeQuery) == null ? void 0 : _b2.call(
    _a2,
    defaultedOptions
  );
  const query = client.getQueryCache().get(defaultedOptions.queryHash);
  defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
  ensureSuspenseTimers(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary, query);
  useClearResetErrorBoundary(errorResetBoundary);
  const isNewCacheEntry = !client.getQueryCache().get(defaultedOptions.queryHash);
  const [observer] = reactExports.useState(
    () => new Observer(
      client,
      defaultedOptions
    )
  );
  const result = observer.getOptimisticResult(defaultedOptions);
  const shouldSubscribe = !isRestoring && options.subscribed !== false;
  reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => {
        const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;
        observer.updateResult();
        return unsubscribe;
      },
      [observer, shouldSubscribe]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  reactExports.useEffect(() => {
    observer.setOptions(defaultedOptions);
  }, [defaultedOptions, observer]);
  if (shouldSuspend(defaultedOptions, result)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  }
  if (getHasError({
    result,
    errorResetBoundary,
    throwOnError: defaultedOptions.throwOnError,
    query,
    suspense: defaultedOptions.suspense
  })) {
    throw result.error;
  }
  (_d = (_c = client.getDefaultOptions().queries) == null ? void 0 : _c._experimental_afterQuery) == null ? void 0 : _d.call(
    _c,
    defaultedOptions,
    result
  );
  if (defaultedOptions.experimental_prefetchInRender && !environmentManager.isServer() && willFetch(result, isRestoring)) {
    const promise = isNewCacheEntry ? (
      // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
      fetchOptimistic(defaultedOptions, observer, errorResetBoundary)
    ) : (
      // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
      query == null ? void 0 : query.promise
    );
    promise == null ? void 0 : promise.catch(noop).finally(() => {
      observer.updateResult();
    });
  }
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
function useQuery(options, queryClient) {
  return useBaseQuery(options, QueryObserver);
}
function useMutation(options, queryClient) {
  const client = useQueryClient();
  const [observer] = reactExports.useState(
    () => new MutationObserver(
      client,
      options
    )
  );
  reactExports.useEffect(() => {
    observer.setOptions(options);
  }, [observer, options]);
  const result = reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => observer.subscribe(notifyManager.batchCalls(onStoreChange)),
      [observer]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  const mutate = reactExports.useCallback(
    (variables, mutateOptions) => {
      observer.mutate(variables, mutateOptions).catch(noop);
    },
    [observer]
  );
  if (result.error && shouldThrowError(observer.options.throwOnError, [result.error])) {
    throw result.error;
  }
  return { ...result, mutate, mutateAsync: result.mutate };
}
function hasAccessControl(actor) {
  return typeof actor === "object" && actor !== null && "_initializeAccessControl" in actor;
}
const ACTOR_QUERY_KEY = "actor";
function useActor(createActor2) {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const actorQuery = useQuery({
    queryKey: [ACTOR_QUERY_KEY, identity == null ? void 0 : identity.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;
      if (!isAuthenticated) {
        return await createActorWithConfig(createActor2);
      }
      const actorOptions = {
        agentOptions: {
          identity
        }
      };
      const actor = await createActorWithConfig(createActor2, actorOptions);
      if (hasAccessControl(actor)) {
        await actor._initializeAccessControl();
      }
      return actor;
    },
    // Only refetch when identity changes
    staleTime: Number.POSITIVE_INFINITY,
    // This will cause the actor to be recreated when the identity changes
    enabled: true
  });
  reactExports.useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
    }
  }, [actorQuery.data, queryClient]);
  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching
  };
}
const Timestamp = Int;
const CommentView = Record({
  "id": Text,
  "authorUsername": Text,
  "content": Text,
  "authorId": Principal$1,
  "createdAt": Timestamp,
  "authorAvatarUrl": Opt(Text),
  "parentId": Opt(Text),
  "likesCount": Nat,
  "authorDisplayName": Text,
  "likedByMe": Bool,
  "postId": Text
});
const CreateGroupInput = Record({
  "name": Text,
  "avatarUrl": Opt(Text),
  "memberIds": Vec(Principal$1)
});
const UserProfileView = Record({
  "id": Principal$1,
  "bio": Text,
  "username": Text,
  "displayName": Text,
  "followersCount": Nat,
  "createdAt": Timestamp,
  "isVerified": Bool,
  "avatarUrl": Opt(Text),
  "isFollowing": Bool,
  "followingCount": Nat,
  "coverUrl": Opt(Text),
  "postsCount": Nat
});
const GroupChatView = Record({
  "members": Vec(Principal$1),
  "lastMessageAt": Opt(Timestamp),
  "adminIds": Vec(Principal$1),
  "name": Text,
  "createdAt": Timestamp,
  "createdBy": Principal$1,
  "lastMessage": Opt(Text),
  "memberProfiles": Vec(UserProfileView),
  "groupId": Text,
  "avatarUrl": Opt(Text),
  "unreadCount": Nat
});
const PostVisibility = Variant({
  "everyone": Null,
  "followers": Null
});
const CreatePostInput = Record({
  "moodTag": Opt(Text),
  "mediaUrl": Opt(Text),
  "caption": Text,
  "visibility": PostVisibility
});
const PostReactionSummary = Record({
  "reactedByMe": Bool,
  "count": Nat,
  "emoji": Text
});
const PostView = Record({
  "id": Text,
  "authorUsername": Text,
  "authorId": Principal$1,
  "moodTag": Opt(Text),
  "createdAt": Timestamp,
  "mediaUrl": Opt(Text),
  "authorAvatarUrl": Opt(Text),
  "caption": Text,
  "commentsCount": Nat,
  "likesCount": Nat,
  "visibility": PostVisibility,
  "authorDisplayName": Text,
  "reactions": Vec(PostReactionSummary),
  "likedByMe": Bool
});
const CreateStoryInput = Record({
  "moodTag": Opt(Text),
  "mediaUrl": Opt(Text),
  "caption": Opt(Text)
});
const StoryView = Record({
  "id": Text,
  "authorUsername": Text,
  "expiresAt": Timestamp,
  "viewedByMe": Bool,
  "authorId": Principal$1,
  "moodTag": Opt(Text),
  "createdAt": Timestamp,
  "mediaUrl": Opt(Text),
  "authorAvatarUrl": Opt(Text),
  "caption": Opt(Text),
  "authorDisplayName": Text,
  "viewsCount": Nat
});
const CallStatus = Variant({
  "active": Null,
  "ringing": Null,
  "missed": Null,
  "ended": Null,
  "declined": Null
});
const CallView = Record({
  "status": CallStatus,
  "startedAt": Timestamp,
  "callerAvatarUrl": Opt(Text),
  "endedAt": Opt(Timestamp),
  "recipientDisplayName": Text,
  "recipientAvatarUrl": Opt(Text),
  "callerId": Principal$1,
  "groupId": Opt(Text),
  "callerUsername": Text,
  "callId": Text,
  "recipientUsername": Text,
  "recipientId": Principal$1,
  "callerDisplayName": Text
});
const Page_4 = Record({
  "hasMore": Bool,
  "items": Vec(CallView),
  "nextCursor": Opt(Text)
});
const DisappearingMode = Variant({
  "d7": Null,
  "h24": Null,
  "off": Null
});
const ChatSettings = Record({
  "wallpaper": Opt(Text),
  "isArchived": Bool,
  "muteUntil": Opt(Timestamp),
  "bubbleColorReceived": Opt(Text),
  "isMuted": Bool,
  "disappearingMode": DisappearingMode,
  "chatName": Opt(Text),
  "bubbleColorSent": Opt(Text)
});
const Conversation = Record({
  "lastMessageAt": Timestamp,
  "lastMessage": Opt(Text),
  "participantId": Principal$1,
  "unreadCount": Nat
});
const MessageStatus = Variant({
  "read": Null,
  "sent": Null,
  "sending": Null,
  "delivered": Null
});
const GroupMessageView = Record({
  "id": Text,
  "status": MessageStatus,
  "senderAvatarUrl": Opt(Text),
  "content": Text,
  "createdAt": Timestamp,
  "senderUsername": Text,
  "senderDisplayName": Text,
  "mediaUrl": Opt(Text),
  "groupId": Text,
  "fromId": Principal$1,
  "replyToId": Opt(Text),
  "reactions": Vec(Tuple(Text, Vec(Principal$1)))
});
const Page_3 = Record({
  "hasMore": Bool,
  "items": Vec(GroupMessageView),
  "nextCursor": Opt(Text)
});
const Page = Record({
  "hasMore": Bool,
  "items": Vec(PostView),
  "nextCursor": Opt(Text)
});
const MessageView = Record({
  "id": Text,
  "status": MessageStatus,
  "content": Text,
  "createdAt": Timestamp,
  "toId": Principal$1,
  "emojiReaction": Opt(Text),
  "mediaUrl": Opt(Text),
  "disappearsAt": Opt(Timestamp),
  "fromId": Principal$1,
  "replyToId": Opt(Text)
});
const Page_2 = Record({
  "hasMore": Bool,
  "items": Vec(MessageView),
  "nextCursor": Opt(Text)
});
const NotificationType = Variant({
  "incomingCall": Null,
  "groupInvite": Null,
  "storyReply": Null,
  "like": Null,
  "postReaction": Null,
  "comment": Null,
  "message": Null,
  "missedCall": Null,
  "follow": Null
});
const NotificationView = Record({
  "id": Text,
  "notifType": NotificationType,
  "actorAvatarUrl": Opt(Text),
  "createdAt": Timestamp,
  "referenceId": Opt(Text),
  "isRead": Bool,
  "actorId": Principal$1,
  "actorUsername": Text,
  "recipientId": Principal$1
});
const Page_1 = Record({
  "hasMore": Bool,
  "items": Vec(NotificationView),
  "nextCursor": Opt(Text)
});
const UpsertProfileInput = Record({
  "bio": Text,
  "username": Text,
  "displayName": Text,
  "avatarUrl": Opt(Text),
  "coverUrl": Opt(Text)
});
Service({
  "addComment": Func(
    [Text, Text, Opt(Text)],
    [CommentView],
    []
  ),
  "addGroupMember": Func([Text, Principal$1], [], []),
  "createGroup": Func([CreateGroupInput], [GroupChatView], []),
  "createPost": Func([CreatePostInput], [PostView], []),
  "createStory": Func([CreateStoryInput], [StoryView], []),
  "deleteComment": Func([Text], [], []),
  "deleteGroup": Func([Text], [], []),
  "deletePost": Func([Text], [], []),
  "demoteGroupAdmin": Func([Text, Principal$1], [], []),
  "endCall": Func([Text], [CallView], []),
  "follow": Func([Principal$1], [], []),
  "getActiveStories": Func([], [Vec(StoryView)], ["query"]),
  "getCallHistory": Func([Opt(Text)], [Page_4], ["query"]),
  "getChatSettings": Func([Principal$1], [ChatSettings], ["query"]),
  "getComments": Func([Text], [Vec(CommentView)], ["query"]),
  "getConversations": Func([], [Vec(Conversation)], ["query"]),
  "getFollowers": Func(
    [Principal$1],
    [Vec(Principal$1)],
    ["query"]
  ),
  "getFollowing": Func(
    [Principal$1],
    [Vec(Principal$1)],
    ["query"]
  ),
  "getGroupChats": Func([], [Vec(GroupChatView)], ["query"]),
  "getGroupMessages": Func(
    [Text, Opt(Text)],
    [Page_3],
    ["query"]
  ),
  "getHomeFeed": Func([Opt(Text)], [Page], ["query"]),
  "getMessages": Func(
    [Principal$1, Opt(Text)],
    [Page_2],
    ["query"]
  ),
  "getMyProfile": Func([], [Opt(UserProfileView)], ["query"]),
  "getNotifications": Func([Opt(Text)], [Page_1], ["query"]),
  "getPost": Func([Text], [Opt(PostView)], ["query"]),
  "getPostReactions": Func(
    [Text],
    [Vec(PostReactionSummary)],
    ["query"]
  ),
  "getProfile": Func(
    [Principal$1],
    [Opt(UserProfileView)],
    ["query"]
  ),
  "getStoryViewers": Func(
    [Text],
    [Vec(UserProfileView)],
    ["query"]
  ),
  "getSuggestedUsers": Func([], [Vec(UserProfileView)], ["query"]),
  "getTrendingPosts": Func([Opt(Text)], [Page], ["query"]),
  "getUnreadCount": Func([], [Nat], ["query"]),
  "getUserPosts": Func(
    [Principal$1, Opt(Text)],
    [Page],
    ["query"]
  ),
  "isFollowing": Func([Principal$1], [Bool], ["query"]),
  "leaveGroup": Func([Text], [], []),
  "likeComment": Func([Text], [], []),
  "likePost": Func([Text], [], []),
  "listFollowers": Func(
    [Principal$1],
    [Vec(UserProfileView)],
    ["query"]
  ),
  "listFollowing": Func(
    [Principal$1],
    [Vec(UserProfileView)],
    ["query"]
  ),
  "markAllNotificationsRead": Func([], [], []),
  "markAsRead": Func([Principal$1], [], []),
  "markNotificationRead": Func([Text], [], []),
  "promoteGroupAdmin": Func([Text, Principal$1], [], []),
  "reactToMessage": Func([Text, Text], [], []),
  "reactToPost": Func([Text, Text], [], []),
  "removeGroupMember": Func([Text, Principal$1], [], []),
  "removePostReaction": Func([Text], [], []),
  "searchUsers": Func([Text], [Vec(UserProfileView)], ["query"]),
  "sendGroupMessage": Func(
    [Text, Text, Opt(Text), Opt(Text)],
    [GroupMessageView],
    []
  ),
  "sendMessage": Func(
    [Principal$1, Text, Opt(Text), Opt(Text)],
    [MessageView],
    []
  ),
  "startCall": Func([Principal$1], [CallView], []),
  "unfollow": Func([Principal$1], [], []),
  "unlikePost": Func([Text], [], []),
  "updateCallStatus": Func([Text, CallStatus], [CallView], []),
  "updateChatSettings": Func([Principal$1, ChatSettings], [], []),
  "updateGroupInfo": Func(
    [Text, Opt(Text), Opt(Text)],
    [GroupChatView],
    []
  ),
  "upsertProfile": Func([UpsertProfileInput], [UserProfileView], []),
  "viewStory": Func([Text], [], [])
});
const idlFactory = ({ IDL: IDL2 }) => {
  const Timestamp2 = IDL2.Int;
  const CommentView2 = IDL2.Record({
    "id": IDL2.Text,
    "authorUsername": IDL2.Text,
    "content": IDL2.Text,
    "authorId": IDL2.Principal,
    "createdAt": Timestamp2,
    "authorAvatarUrl": IDL2.Opt(IDL2.Text),
    "parentId": IDL2.Opt(IDL2.Text),
    "likesCount": IDL2.Nat,
    "authorDisplayName": IDL2.Text,
    "likedByMe": IDL2.Bool,
    "postId": IDL2.Text
  });
  const CreateGroupInput2 = IDL2.Record({
    "name": IDL2.Text,
    "avatarUrl": IDL2.Opt(IDL2.Text),
    "memberIds": IDL2.Vec(IDL2.Principal)
  });
  const UserProfileView2 = IDL2.Record({
    "id": IDL2.Principal,
    "bio": IDL2.Text,
    "username": IDL2.Text,
    "displayName": IDL2.Text,
    "followersCount": IDL2.Nat,
    "createdAt": Timestamp2,
    "isVerified": IDL2.Bool,
    "avatarUrl": IDL2.Opt(IDL2.Text),
    "isFollowing": IDL2.Bool,
    "followingCount": IDL2.Nat,
    "coverUrl": IDL2.Opt(IDL2.Text),
    "postsCount": IDL2.Nat
  });
  const GroupChatView2 = IDL2.Record({
    "members": IDL2.Vec(IDL2.Principal),
    "lastMessageAt": IDL2.Opt(Timestamp2),
    "adminIds": IDL2.Vec(IDL2.Principal),
    "name": IDL2.Text,
    "createdAt": Timestamp2,
    "createdBy": IDL2.Principal,
    "lastMessage": IDL2.Opt(IDL2.Text),
    "memberProfiles": IDL2.Vec(UserProfileView2),
    "groupId": IDL2.Text,
    "avatarUrl": IDL2.Opt(IDL2.Text),
    "unreadCount": IDL2.Nat
  });
  const PostVisibility2 = IDL2.Variant({
    "everyone": IDL2.Null,
    "followers": IDL2.Null
  });
  const CreatePostInput2 = IDL2.Record({
    "moodTag": IDL2.Opt(IDL2.Text),
    "mediaUrl": IDL2.Opt(IDL2.Text),
    "caption": IDL2.Text,
    "visibility": PostVisibility2
  });
  const PostReactionSummary2 = IDL2.Record({
    "reactedByMe": IDL2.Bool,
    "count": IDL2.Nat,
    "emoji": IDL2.Text
  });
  const PostView2 = IDL2.Record({
    "id": IDL2.Text,
    "authorUsername": IDL2.Text,
    "authorId": IDL2.Principal,
    "moodTag": IDL2.Opt(IDL2.Text),
    "createdAt": Timestamp2,
    "mediaUrl": IDL2.Opt(IDL2.Text),
    "authorAvatarUrl": IDL2.Opt(IDL2.Text),
    "caption": IDL2.Text,
    "commentsCount": IDL2.Nat,
    "likesCount": IDL2.Nat,
    "visibility": PostVisibility2,
    "authorDisplayName": IDL2.Text,
    "reactions": IDL2.Vec(PostReactionSummary2),
    "likedByMe": IDL2.Bool
  });
  const CreateStoryInput2 = IDL2.Record({
    "moodTag": IDL2.Opt(IDL2.Text),
    "mediaUrl": IDL2.Opt(IDL2.Text),
    "caption": IDL2.Opt(IDL2.Text)
  });
  const StoryView2 = IDL2.Record({
    "id": IDL2.Text,
    "authorUsername": IDL2.Text,
    "expiresAt": Timestamp2,
    "viewedByMe": IDL2.Bool,
    "authorId": IDL2.Principal,
    "moodTag": IDL2.Opt(IDL2.Text),
    "createdAt": Timestamp2,
    "mediaUrl": IDL2.Opt(IDL2.Text),
    "authorAvatarUrl": IDL2.Opt(IDL2.Text),
    "caption": IDL2.Opt(IDL2.Text),
    "authorDisplayName": IDL2.Text,
    "viewsCount": IDL2.Nat
  });
  const CallStatus2 = IDL2.Variant({
    "active": IDL2.Null,
    "ringing": IDL2.Null,
    "missed": IDL2.Null,
    "ended": IDL2.Null,
    "declined": IDL2.Null
  });
  const CallView2 = IDL2.Record({
    "status": CallStatus2,
    "startedAt": Timestamp2,
    "callerAvatarUrl": IDL2.Opt(IDL2.Text),
    "endedAt": IDL2.Opt(Timestamp2),
    "recipientDisplayName": IDL2.Text,
    "recipientAvatarUrl": IDL2.Opt(IDL2.Text),
    "callerId": IDL2.Principal,
    "groupId": IDL2.Opt(IDL2.Text),
    "callerUsername": IDL2.Text,
    "callId": IDL2.Text,
    "recipientUsername": IDL2.Text,
    "recipientId": IDL2.Principal,
    "callerDisplayName": IDL2.Text
  });
  const Page_42 = IDL2.Record({
    "hasMore": IDL2.Bool,
    "items": IDL2.Vec(CallView2),
    "nextCursor": IDL2.Opt(IDL2.Text)
  });
  const DisappearingMode2 = IDL2.Variant({
    "d7": IDL2.Null,
    "h24": IDL2.Null,
    "off": IDL2.Null
  });
  const ChatSettings2 = IDL2.Record({
    "wallpaper": IDL2.Opt(IDL2.Text),
    "isArchived": IDL2.Bool,
    "muteUntil": IDL2.Opt(Timestamp2),
    "bubbleColorReceived": IDL2.Opt(IDL2.Text),
    "isMuted": IDL2.Bool,
    "disappearingMode": DisappearingMode2,
    "chatName": IDL2.Opt(IDL2.Text),
    "bubbleColorSent": IDL2.Opt(IDL2.Text)
  });
  const Conversation2 = IDL2.Record({
    "lastMessageAt": Timestamp2,
    "lastMessage": IDL2.Opt(IDL2.Text),
    "participantId": IDL2.Principal,
    "unreadCount": IDL2.Nat
  });
  const MessageStatus2 = IDL2.Variant({
    "read": IDL2.Null,
    "sent": IDL2.Null,
    "sending": IDL2.Null,
    "delivered": IDL2.Null
  });
  const GroupMessageView2 = IDL2.Record({
    "id": IDL2.Text,
    "status": MessageStatus2,
    "senderAvatarUrl": IDL2.Opt(IDL2.Text),
    "content": IDL2.Text,
    "createdAt": Timestamp2,
    "senderUsername": IDL2.Text,
    "senderDisplayName": IDL2.Text,
    "mediaUrl": IDL2.Opt(IDL2.Text),
    "groupId": IDL2.Text,
    "fromId": IDL2.Principal,
    "replyToId": IDL2.Opt(IDL2.Text),
    "reactions": IDL2.Vec(IDL2.Tuple(IDL2.Text, IDL2.Vec(IDL2.Principal)))
  });
  const Page_32 = IDL2.Record({
    "hasMore": IDL2.Bool,
    "items": IDL2.Vec(GroupMessageView2),
    "nextCursor": IDL2.Opt(IDL2.Text)
  });
  const Page2 = IDL2.Record({
    "hasMore": IDL2.Bool,
    "items": IDL2.Vec(PostView2),
    "nextCursor": IDL2.Opt(IDL2.Text)
  });
  const MessageView2 = IDL2.Record({
    "id": IDL2.Text,
    "status": MessageStatus2,
    "content": IDL2.Text,
    "createdAt": Timestamp2,
    "toId": IDL2.Principal,
    "emojiReaction": IDL2.Opt(IDL2.Text),
    "mediaUrl": IDL2.Opt(IDL2.Text),
    "disappearsAt": IDL2.Opt(Timestamp2),
    "fromId": IDL2.Principal,
    "replyToId": IDL2.Opt(IDL2.Text)
  });
  const Page_22 = IDL2.Record({
    "hasMore": IDL2.Bool,
    "items": IDL2.Vec(MessageView2),
    "nextCursor": IDL2.Opt(IDL2.Text)
  });
  const NotificationType2 = IDL2.Variant({
    "incomingCall": IDL2.Null,
    "groupInvite": IDL2.Null,
    "storyReply": IDL2.Null,
    "like": IDL2.Null,
    "postReaction": IDL2.Null,
    "comment": IDL2.Null,
    "message": IDL2.Null,
    "missedCall": IDL2.Null,
    "follow": IDL2.Null
  });
  const NotificationView2 = IDL2.Record({
    "id": IDL2.Text,
    "notifType": NotificationType2,
    "actorAvatarUrl": IDL2.Opt(IDL2.Text),
    "createdAt": Timestamp2,
    "referenceId": IDL2.Opt(IDL2.Text),
    "isRead": IDL2.Bool,
    "actorId": IDL2.Principal,
    "actorUsername": IDL2.Text,
    "recipientId": IDL2.Principal
  });
  const Page_12 = IDL2.Record({
    "hasMore": IDL2.Bool,
    "items": IDL2.Vec(NotificationView2),
    "nextCursor": IDL2.Opt(IDL2.Text)
  });
  const UpsertProfileInput2 = IDL2.Record({
    "bio": IDL2.Text,
    "username": IDL2.Text,
    "displayName": IDL2.Text,
    "avatarUrl": IDL2.Opt(IDL2.Text),
    "coverUrl": IDL2.Opt(IDL2.Text)
  });
  return IDL2.Service({
    "addComment": IDL2.Func(
      [IDL2.Text, IDL2.Text, IDL2.Opt(IDL2.Text)],
      [CommentView2],
      []
    ),
    "addGroupMember": IDL2.Func([IDL2.Text, IDL2.Principal], [], []),
    "createGroup": IDL2.Func([CreateGroupInput2], [GroupChatView2], []),
    "createPost": IDL2.Func([CreatePostInput2], [PostView2], []),
    "createStory": IDL2.Func([CreateStoryInput2], [StoryView2], []),
    "deleteComment": IDL2.Func([IDL2.Text], [], []),
    "deleteGroup": IDL2.Func([IDL2.Text], [], []),
    "deletePost": IDL2.Func([IDL2.Text], [], []),
    "demoteGroupAdmin": IDL2.Func([IDL2.Text, IDL2.Principal], [], []),
    "endCall": IDL2.Func([IDL2.Text], [CallView2], []),
    "follow": IDL2.Func([IDL2.Principal], [], []),
    "getActiveStories": IDL2.Func([], [IDL2.Vec(StoryView2)], ["query"]),
    "getCallHistory": IDL2.Func([IDL2.Opt(IDL2.Text)], [Page_42], ["query"]),
    "getChatSettings": IDL2.Func([IDL2.Principal], [ChatSettings2], ["query"]),
    "getComments": IDL2.Func([IDL2.Text], [IDL2.Vec(CommentView2)], ["query"]),
    "getConversations": IDL2.Func([], [IDL2.Vec(Conversation2)], ["query"]),
    "getFollowers": IDL2.Func(
      [IDL2.Principal],
      [IDL2.Vec(IDL2.Principal)],
      ["query"]
    ),
    "getFollowing": IDL2.Func(
      [IDL2.Principal],
      [IDL2.Vec(IDL2.Principal)],
      ["query"]
    ),
    "getGroupChats": IDL2.Func([], [IDL2.Vec(GroupChatView2)], ["query"]),
    "getGroupMessages": IDL2.Func(
      [IDL2.Text, IDL2.Opt(IDL2.Text)],
      [Page_32],
      ["query"]
    ),
    "getHomeFeed": IDL2.Func([IDL2.Opt(IDL2.Text)], [Page2], ["query"]),
    "getMessages": IDL2.Func(
      [IDL2.Principal, IDL2.Opt(IDL2.Text)],
      [Page_22],
      ["query"]
    ),
    "getMyProfile": IDL2.Func([], [IDL2.Opt(UserProfileView2)], ["query"]),
    "getNotifications": IDL2.Func([IDL2.Opt(IDL2.Text)], [Page_12], ["query"]),
    "getPost": IDL2.Func([IDL2.Text], [IDL2.Opt(PostView2)], ["query"]),
    "getPostReactions": IDL2.Func(
      [IDL2.Text],
      [IDL2.Vec(PostReactionSummary2)],
      ["query"]
    ),
    "getProfile": IDL2.Func(
      [IDL2.Principal],
      [IDL2.Opt(UserProfileView2)],
      ["query"]
    ),
    "getStoryViewers": IDL2.Func(
      [IDL2.Text],
      [IDL2.Vec(UserProfileView2)],
      ["query"]
    ),
    "getSuggestedUsers": IDL2.Func([], [IDL2.Vec(UserProfileView2)], ["query"]),
    "getTrendingPosts": IDL2.Func([IDL2.Opt(IDL2.Text)], [Page2], ["query"]),
    "getUnreadCount": IDL2.Func([], [IDL2.Nat], ["query"]),
    "getUserPosts": IDL2.Func(
      [IDL2.Principal, IDL2.Opt(IDL2.Text)],
      [Page2],
      ["query"]
    ),
    "isFollowing": IDL2.Func([IDL2.Principal], [IDL2.Bool], ["query"]),
    "leaveGroup": IDL2.Func([IDL2.Text], [], []),
    "likeComment": IDL2.Func([IDL2.Text], [], []),
    "likePost": IDL2.Func([IDL2.Text], [], []),
    "listFollowers": IDL2.Func(
      [IDL2.Principal],
      [IDL2.Vec(UserProfileView2)],
      ["query"]
    ),
    "listFollowing": IDL2.Func(
      [IDL2.Principal],
      [IDL2.Vec(UserProfileView2)],
      ["query"]
    ),
    "markAllNotificationsRead": IDL2.Func([], [], []),
    "markAsRead": IDL2.Func([IDL2.Principal], [], []),
    "markNotificationRead": IDL2.Func([IDL2.Text], [], []),
    "promoteGroupAdmin": IDL2.Func([IDL2.Text, IDL2.Principal], [], []),
    "reactToMessage": IDL2.Func([IDL2.Text, IDL2.Text], [], []),
    "reactToPost": IDL2.Func([IDL2.Text, IDL2.Text], [], []),
    "removeGroupMember": IDL2.Func([IDL2.Text, IDL2.Principal], [], []),
    "removePostReaction": IDL2.Func([IDL2.Text], [], []),
    "searchUsers": IDL2.Func([IDL2.Text], [IDL2.Vec(UserProfileView2)], ["query"]),
    "sendGroupMessage": IDL2.Func(
      [IDL2.Text, IDL2.Text, IDL2.Opt(IDL2.Text), IDL2.Opt(IDL2.Text)],
      [GroupMessageView2],
      []
    ),
    "sendMessage": IDL2.Func(
      [IDL2.Principal, IDL2.Text, IDL2.Opt(IDL2.Text), IDL2.Opt(IDL2.Text)],
      [MessageView2],
      []
    ),
    "startCall": IDL2.Func([IDL2.Principal], [CallView2], []),
    "unfollow": IDL2.Func([IDL2.Principal], [], []),
    "unlikePost": IDL2.Func([IDL2.Text], [], []),
    "updateCallStatus": IDL2.Func([IDL2.Text, CallStatus2], [CallView2], []),
    "updateChatSettings": IDL2.Func([IDL2.Principal, ChatSettings2], [], []),
    "updateGroupInfo": IDL2.Func(
      [IDL2.Text, IDL2.Opt(IDL2.Text), IDL2.Opt(IDL2.Text)],
      [GroupChatView2],
      []
    ),
    "upsertProfile": IDL2.Func([UpsertProfileInput2], [UserProfileView2], []),
    "viewStory": IDL2.Func([IDL2.Text], [], [])
  });
};
function candid_some(value) {
  return [
    value
  ];
}
function candid_none() {
  return [];
}
function record_opt_to_undefined(arg) {
  return arg == null ? void 0 : arg;
}
class Backend {
  constructor(actor, _uploadFile, _downloadFile, processError) {
    this.actor = actor;
    this._uploadFile = _uploadFile;
    this._downloadFile = _downloadFile;
    this.processError = processError;
  }
  async addComment(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.addComment(arg0, arg1, to_candid_opt_n1(this._uploadFile, this._downloadFile, arg2));
        return from_candid_CommentView_n2(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.addComment(arg0, arg1, to_candid_opt_n1(this._uploadFile, this._downloadFile, arg2));
      return from_candid_CommentView_n2(this._uploadFile, this._downloadFile, result);
    }
  }
  async addGroupMember(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.addGroupMember(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.addGroupMember(arg0, arg1);
      return result;
    }
  }
  async createGroup(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createGroup(to_candid_CreateGroupInput_n5(this._uploadFile, this._downloadFile, arg0));
        return from_candid_GroupChatView_n7(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createGroup(to_candid_CreateGroupInput_n5(this._uploadFile, this._downloadFile, arg0));
      return from_candid_GroupChatView_n7(this._uploadFile, this._downloadFile, result);
    }
  }
  async createPost(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createPost(to_candid_CreatePostInput_n13(this._uploadFile, this._downloadFile, arg0));
        return from_candid_PostView_n17(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createPost(to_candid_CreatePostInput_n13(this._uploadFile, this._downloadFile, arg0));
      return from_candid_PostView_n17(this._uploadFile, this._downloadFile, result);
    }
  }
  async createStory(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createStory(to_candid_CreateStoryInput_n21(this._uploadFile, this._downloadFile, arg0));
        return from_candid_StoryView_n23(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createStory(to_candid_CreateStoryInput_n21(this._uploadFile, this._downloadFile, arg0));
      return from_candid_StoryView_n23(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteComment(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteComment(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteComment(arg0);
      return result;
    }
  }
  async deleteGroup(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteGroup(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteGroup(arg0);
      return result;
    }
  }
  async deletePost(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deletePost(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deletePost(arg0);
      return result;
    }
  }
  async demoteGroupAdmin(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.demoteGroupAdmin(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.demoteGroupAdmin(arg0, arg1);
      return result;
    }
  }
  async endCall(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.endCall(arg0);
        return from_candid_CallView_n25(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.endCall(arg0);
      return from_candid_CallView_n25(this._uploadFile, this._downloadFile, result);
    }
  }
  async follow(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.follow(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.follow(arg0);
      return result;
    }
  }
  async getActiveStories() {
    if (this.processError) {
      try {
        const result = await this.actor.getActiveStories();
        return from_candid_vec_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getActiveStories();
      return from_candid_vec_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCallHistory(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getCallHistory(to_candid_opt_n1(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Page_4_n30(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCallHistory(to_candid_opt_n1(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Page_4_n30(this._uploadFile, this._downloadFile, result);
    }
  }
  async getChatSettings(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getChatSettings(arg0);
        return from_candid_ChatSettings_n33(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getChatSettings(arg0);
      return from_candid_ChatSettings_n33(this._uploadFile, this._downloadFile, result);
    }
  }
  async getComments(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getComments(arg0);
        return from_candid_vec_n37(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getComments(arg0);
      return from_candid_vec_n37(this._uploadFile, this._downloadFile, result);
    }
  }
  async getConversations() {
    if (this.processError) {
      try {
        const result = await this.actor.getConversations();
        return from_candid_vec_n38(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getConversations();
      return from_candid_vec_n38(this._uploadFile, this._downloadFile, result);
    }
  }
  async getFollowers(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getFollowers(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getFollowers(arg0);
      return result;
    }
  }
  async getFollowing(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getFollowing(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getFollowing(arg0);
      return result;
    }
  }
  async getGroupChats() {
    if (this.processError) {
      try {
        const result = await this.actor.getGroupChats();
        return from_candid_vec_n41(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getGroupChats();
      return from_candid_vec_n41(this._uploadFile, this._downloadFile, result);
    }
  }
  async getGroupMessages(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getGroupMessages(arg0, to_candid_opt_n1(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Page_3_n42(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getGroupMessages(arg0, to_candid_opt_n1(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Page_3_n42(this._uploadFile, this._downloadFile, result);
    }
  }
  async getHomeFeed(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getHomeFeed(to_candid_opt_n1(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Page_n49(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getHomeFeed(to_candid_opt_n1(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Page_n49(this._uploadFile, this._downloadFile, result);
    }
  }
  async getMessages(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getMessages(arg0, to_candid_opt_n1(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Page_2_n52(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMessages(arg0, to_candid_opt_n1(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Page_2_n52(this._uploadFile, this._downloadFile, result);
    }
  }
  async getMyProfile() {
    if (this.processError) {
      try {
        const result = await this.actor.getMyProfile();
        return from_candid_opt_n57(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMyProfile();
      return from_candid_opt_n57(this._uploadFile, this._downloadFile, result);
    }
  }
  async getNotifications(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getNotifications(to_candid_opt_n1(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Page_1_n58(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getNotifications(to_candid_opt_n1(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Page_1_n58(this._uploadFile, this._downloadFile, result);
    }
  }
  async getPost(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getPost(arg0);
        return from_candid_opt_n65(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getPost(arg0);
      return from_candid_opt_n65(this._uploadFile, this._downloadFile, result);
    }
  }
  async getPostReactions(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getPostReactions(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getPostReactions(arg0);
      return result;
    }
  }
  async getProfile(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getProfile(arg0);
        return from_candid_opt_n57(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getProfile(arg0);
      return from_candid_opt_n57(this._uploadFile, this._downloadFile, result);
    }
  }
  async getStoryViewers(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getStoryViewers(arg0);
        return from_candid_vec_n10(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getStoryViewers(arg0);
      return from_candid_vec_n10(this._uploadFile, this._downloadFile, result);
    }
  }
  async getSuggestedUsers() {
    if (this.processError) {
      try {
        const result = await this.actor.getSuggestedUsers();
        return from_candid_vec_n10(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getSuggestedUsers();
      return from_candid_vec_n10(this._uploadFile, this._downloadFile, result);
    }
  }
  async getTrendingPosts(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getTrendingPosts(to_candid_opt_n1(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Page_n49(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getTrendingPosts(to_candid_opt_n1(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Page_n49(this._uploadFile, this._downloadFile, result);
    }
  }
  async getUnreadCount() {
    if (this.processError) {
      try {
        const result = await this.actor.getUnreadCount();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUnreadCount();
      return result;
    }
  }
  async getUserPosts(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getUserPosts(arg0, to_candid_opt_n1(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Page_n49(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUserPosts(arg0, to_candid_opt_n1(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Page_n49(this._uploadFile, this._downloadFile, result);
    }
  }
  async isFollowing(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.isFollowing(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.isFollowing(arg0);
      return result;
    }
  }
  async leaveGroup(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.leaveGroup(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.leaveGroup(arg0);
      return result;
    }
  }
  async likeComment(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.likeComment(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.likeComment(arg0);
      return result;
    }
  }
  async likePost(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.likePost(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.likePost(arg0);
      return result;
    }
  }
  async listFollowers(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.listFollowers(arg0);
        return from_candid_vec_n10(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listFollowers(arg0);
      return from_candid_vec_n10(this._uploadFile, this._downloadFile, result);
    }
  }
  async listFollowing(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.listFollowing(arg0);
        return from_candid_vec_n10(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listFollowing(arg0);
      return from_candid_vec_n10(this._uploadFile, this._downloadFile, result);
    }
  }
  async markAllNotificationsRead() {
    if (this.processError) {
      try {
        const result = await this.actor.markAllNotificationsRead();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.markAllNotificationsRead();
      return result;
    }
  }
  async markAsRead(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.markAsRead(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.markAsRead(arg0);
      return result;
    }
  }
  async markNotificationRead(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.markNotificationRead(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.markNotificationRead(arg0);
      return result;
    }
  }
  async promoteGroupAdmin(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.promoteGroupAdmin(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.promoteGroupAdmin(arg0, arg1);
      return result;
    }
  }
  async reactToMessage(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.reactToMessage(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.reactToMessage(arg0, arg1);
      return result;
    }
  }
  async reactToPost(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.reactToPost(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.reactToPost(arg0, arg1);
      return result;
    }
  }
  async removeGroupMember(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.removeGroupMember(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.removeGroupMember(arg0, arg1);
      return result;
    }
  }
  async removePostReaction(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.removePostReaction(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.removePostReaction(arg0);
      return result;
    }
  }
  async searchUsers(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.searchUsers(arg0);
        return from_candid_vec_n10(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.searchUsers(arg0);
      return from_candid_vec_n10(this._uploadFile, this._downloadFile, result);
    }
  }
  async sendGroupMessage(arg0, arg1, arg2, arg3) {
    if (this.processError) {
      try {
        const result = await this.actor.sendGroupMessage(arg0, arg1, to_candid_opt_n1(this._uploadFile, this._downloadFile, arg2), to_candid_opt_n1(this._uploadFile, this._downloadFile, arg3));
        return from_candid_GroupMessageView_n45(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.sendGroupMessage(arg0, arg1, to_candid_opt_n1(this._uploadFile, this._downloadFile, arg2), to_candid_opt_n1(this._uploadFile, this._downloadFile, arg3));
      return from_candid_GroupMessageView_n45(this._uploadFile, this._downloadFile, result);
    }
  }
  async sendMessage(arg0, arg1, arg2, arg3) {
    if (this.processError) {
      try {
        const result = await this.actor.sendMessage(arg0, arg1, to_candid_opt_n1(this._uploadFile, this._downloadFile, arg2), to_candid_opt_n1(this._uploadFile, this._downloadFile, arg3));
        return from_candid_MessageView_n55(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.sendMessage(arg0, arg1, to_candid_opt_n1(this._uploadFile, this._downloadFile, arg2), to_candid_opt_n1(this._uploadFile, this._downloadFile, arg3));
      return from_candid_MessageView_n55(this._uploadFile, this._downloadFile, result);
    }
  }
  async startCall(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.startCall(arg0);
        return from_candid_CallView_n25(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.startCall(arg0);
      return from_candid_CallView_n25(this._uploadFile, this._downloadFile, result);
    }
  }
  async unfollow(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.unfollow(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.unfollow(arg0);
      return result;
    }
  }
  async unlikePost(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.unlikePost(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.unlikePost(arg0);
      return result;
    }
  }
  async updateCallStatus(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateCallStatus(arg0, to_candid_CallStatus_n66(this._uploadFile, this._downloadFile, arg1));
        return from_candid_CallView_n25(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateCallStatus(arg0, to_candid_CallStatus_n66(this._uploadFile, this._downloadFile, arg1));
      return from_candid_CallView_n25(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateChatSettings(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateChatSettings(arg0, to_candid_ChatSettings_n68(this._uploadFile, this._downloadFile, arg1));
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateChatSettings(arg0, to_candid_ChatSettings_n68(this._uploadFile, this._downloadFile, arg1));
      return result;
    }
  }
  async updateGroupInfo(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.updateGroupInfo(arg0, to_candid_opt_n1(this._uploadFile, this._downloadFile, arg1), to_candid_opt_n1(this._uploadFile, this._downloadFile, arg2));
        return from_candid_GroupChatView_n7(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateGroupInfo(arg0, to_candid_opt_n1(this._uploadFile, this._downloadFile, arg1), to_candid_opt_n1(this._uploadFile, this._downloadFile, arg2));
      return from_candid_GroupChatView_n7(this._uploadFile, this._downloadFile, result);
    }
  }
  async upsertProfile(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.upsertProfile(to_candid_UpsertProfileInput_n72(this._uploadFile, this._downloadFile, arg0));
        return from_candid_UserProfileView_n11(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.upsertProfile(to_candid_UpsertProfileInput_n72(this._uploadFile, this._downloadFile, arg0));
      return from_candid_UserProfileView_n11(this._uploadFile, this._downloadFile, result);
    }
  }
  async viewStory(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.viewStory(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.viewStory(arg0);
      return result;
    }
  }
}
function from_candid_CallStatus_n27(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n28(_uploadFile, _downloadFile, value);
}
function from_candid_CallView_n25(_uploadFile, _downloadFile, value) {
  return from_candid_record_n26(_uploadFile, _downloadFile, value);
}
function from_candid_ChatSettings_n33(_uploadFile, _downloadFile, value) {
  return from_candid_record_n34(_uploadFile, _downloadFile, value);
}
function from_candid_CommentView_n2(_uploadFile, _downloadFile, value) {
  return from_candid_record_n3(_uploadFile, _downloadFile, value);
}
function from_candid_Conversation_n39(_uploadFile, _downloadFile, value) {
  return from_candid_record_n40(_uploadFile, _downloadFile, value);
}
function from_candid_DisappearingMode_n35(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n36(_uploadFile, _downloadFile, value);
}
function from_candid_GroupChatView_n7(_uploadFile, _downloadFile, value) {
  return from_candid_record_n8(_uploadFile, _downloadFile, value);
}
function from_candid_GroupMessageView_n45(_uploadFile, _downloadFile, value) {
  return from_candid_record_n46(_uploadFile, _downloadFile, value);
}
function from_candid_MessageStatus_n47(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n48(_uploadFile, _downloadFile, value);
}
function from_candid_MessageView_n55(_uploadFile, _downloadFile, value) {
  return from_candid_record_n56(_uploadFile, _downloadFile, value);
}
function from_candid_NotificationType_n63(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n64(_uploadFile, _downloadFile, value);
}
function from_candid_NotificationView_n61(_uploadFile, _downloadFile, value) {
  return from_candid_record_n62(_uploadFile, _downloadFile, value);
}
function from_candid_Page_1_n58(_uploadFile, _downloadFile, value) {
  return from_candid_record_n59(_uploadFile, _downloadFile, value);
}
function from_candid_Page_2_n52(_uploadFile, _downloadFile, value) {
  return from_candid_record_n53(_uploadFile, _downloadFile, value);
}
function from_candid_Page_3_n42(_uploadFile, _downloadFile, value) {
  return from_candid_record_n43(_uploadFile, _downloadFile, value);
}
function from_candid_Page_4_n30(_uploadFile, _downloadFile, value) {
  return from_candid_record_n31(_uploadFile, _downloadFile, value);
}
function from_candid_Page_n49(_uploadFile, _downloadFile, value) {
  return from_candid_record_n50(_uploadFile, _downloadFile, value);
}
function from_candid_PostView_n17(_uploadFile, _downloadFile, value) {
  return from_candid_record_n18(_uploadFile, _downloadFile, value);
}
function from_candid_PostVisibility_n19(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n20(_uploadFile, _downloadFile, value);
}
function from_candid_StoryView_n23(_uploadFile, _downloadFile, value) {
  return from_candid_record_n24(_uploadFile, _downloadFile, value);
}
function from_candid_UserProfileView_n11(_uploadFile, _downloadFile, value) {
  return from_candid_record_n12(_uploadFile, _downloadFile, value);
}
function from_candid_opt_n4(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n57(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_UserProfileView_n11(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n65(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_PostView_n17(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n9(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_record_n12(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    bio: value.bio,
    username: value.username,
    displayName: value.displayName,
    followersCount: value.followersCount,
    createdAt: value.createdAt,
    isVerified: value.isVerified,
    avatarUrl: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.avatarUrl)),
    isFollowing: value.isFollowing,
    followingCount: value.followingCount,
    coverUrl: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.coverUrl)),
    postsCount: value.postsCount
  };
}
function from_candid_record_n18(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    authorUsername: value.authorUsername,
    authorId: value.authorId,
    moodTag: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.moodTag)),
    createdAt: value.createdAt,
    mediaUrl: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.mediaUrl)),
    authorAvatarUrl: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.authorAvatarUrl)),
    caption: value.caption,
    commentsCount: value.commentsCount,
    likesCount: value.likesCount,
    visibility: from_candid_PostVisibility_n19(_uploadFile, _downloadFile, value.visibility),
    authorDisplayName: value.authorDisplayName,
    reactions: value.reactions,
    likedByMe: value.likedByMe
  };
}
function from_candid_record_n24(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    authorUsername: value.authorUsername,
    expiresAt: value.expiresAt,
    viewedByMe: value.viewedByMe,
    authorId: value.authorId,
    moodTag: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.moodTag)),
    createdAt: value.createdAt,
    mediaUrl: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.mediaUrl)),
    authorAvatarUrl: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.authorAvatarUrl)),
    caption: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.caption)),
    authorDisplayName: value.authorDisplayName,
    viewsCount: value.viewsCount
  };
}
function from_candid_record_n26(_uploadFile, _downloadFile, value) {
  return {
    status: from_candid_CallStatus_n27(_uploadFile, _downloadFile, value.status),
    startedAt: value.startedAt,
    callerAvatarUrl: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.callerAvatarUrl)),
    endedAt: record_opt_to_undefined(from_candid_opt_n9(_uploadFile, _downloadFile, value.endedAt)),
    recipientDisplayName: value.recipientDisplayName,
    recipientAvatarUrl: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.recipientAvatarUrl)),
    callerId: value.callerId,
    groupId: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.groupId)),
    callerUsername: value.callerUsername,
    callId: value.callId,
    recipientUsername: value.recipientUsername,
    recipientId: value.recipientId,
    callerDisplayName: value.callerDisplayName
  };
}
function from_candid_record_n3(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    authorUsername: value.authorUsername,
    content: value.content,
    authorId: value.authorId,
    createdAt: value.createdAt,
    authorAvatarUrl: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.authorAvatarUrl)),
    parentId: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.parentId)),
    likesCount: value.likesCount,
    authorDisplayName: value.authorDisplayName,
    likedByMe: value.likedByMe,
    postId: value.postId
  };
}
function from_candid_record_n31(_uploadFile, _downloadFile, value) {
  return {
    hasMore: value.hasMore,
    items: from_candid_vec_n32(_uploadFile, _downloadFile, value.items),
    nextCursor: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.nextCursor))
  };
}
function from_candid_record_n34(_uploadFile, _downloadFile, value) {
  return {
    wallpaper: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.wallpaper)),
    isArchived: value.isArchived,
    muteUntil: record_opt_to_undefined(from_candid_opt_n9(_uploadFile, _downloadFile, value.muteUntil)),
    bubbleColorReceived: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.bubbleColorReceived)),
    isMuted: value.isMuted,
    disappearingMode: from_candid_DisappearingMode_n35(_uploadFile, _downloadFile, value.disappearingMode),
    chatName: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.chatName)),
    bubbleColorSent: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.bubbleColorSent))
  };
}
function from_candid_record_n40(_uploadFile, _downloadFile, value) {
  return {
    lastMessageAt: value.lastMessageAt,
    lastMessage: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.lastMessage)),
    participantId: value.participantId,
    unreadCount: value.unreadCount
  };
}
function from_candid_record_n43(_uploadFile, _downloadFile, value) {
  return {
    hasMore: value.hasMore,
    items: from_candid_vec_n44(_uploadFile, _downloadFile, value.items),
    nextCursor: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.nextCursor))
  };
}
function from_candid_record_n46(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    status: from_candid_MessageStatus_n47(_uploadFile, _downloadFile, value.status),
    senderAvatarUrl: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.senderAvatarUrl)),
    content: value.content,
    createdAt: value.createdAt,
    senderUsername: value.senderUsername,
    senderDisplayName: value.senderDisplayName,
    mediaUrl: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.mediaUrl)),
    groupId: value.groupId,
    fromId: value.fromId,
    replyToId: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.replyToId)),
    reactions: value.reactions
  };
}
function from_candid_record_n50(_uploadFile, _downloadFile, value) {
  return {
    hasMore: value.hasMore,
    items: from_candid_vec_n51(_uploadFile, _downloadFile, value.items),
    nextCursor: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.nextCursor))
  };
}
function from_candid_record_n53(_uploadFile, _downloadFile, value) {
  return {
    hasMore: value.hasMore,
    items: from_candid_vec_n54(_uploadFile, _downloadFile, value.items),
    nextCursor: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.nextCursor))
  };
}
function from_candid_record_n56(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    status: from_candid_MessageStatus_n47(_uploadFile, _downloadFile, value.status),
    content: value.content,
    createdAt: value.createdAt,
    toId: value.toId,
    emojiReaction: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.emojiReaction)),
    mediaUrl: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.mediaUrl)),
    disappearsAt: record_opt_to_undefined(from_candid_opt_n9(_uploadFile, _downloadFile, value.disappearsAt)),
    fromId: value.fromId,
    replyToId: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.replyToId))
  };
}
function from_candid_record_n59(_uploadFile, _downloadFile, value) {
  return {
    hasMore: value.hasMore,
    items: from_candid_vec_n60(_uploadFile, _downloadFile, value.items),
    nextCursor: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.nextCursor))
  };
}
function from_candid_record_n62(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    notifType: from_candid_NotificationType_n63(_uploadFile, _downloadFile, value.notifType),
    actorAvatarUrl: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.actorAvatarUrl)),
    createdAt: value.createdAt,
    referenceId: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.referenceId)),
    isRead: value.isRead,
    actorId: value.actorId,
    actorUsername: value.actorUsername,
    recipientId: value.recipientId
  };
}
function from_candid_record_n8(_uploadFile, _downloadFile, value) {
  return {
    members: value.members,
    lastMessageAt: record_opt_to_undefined(from_candid_opt_n9(_uploadFile, _downloadFile, value.lastMessageAt)),
    adminIds: value.adminIds,
    name: value.name,
    createdAt: value.createdAt,
    createdBy: value.createdBy,
    lastMessage: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.lastMessage)),
    memberProfiles: from_candid_vec_n10(_uploadFile, _downloadFile, value.memberProfiles),
    groupId: value.groupId,
    avatarUrl: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.avatarUrl)),
    unreadCount: value.unreadCount
  };
}
function from_candid_variant_n20(_uploadFile, _downloadFile, value) {
  return "everyone" in value ? "everyone" : "followers" in value ? "followers" : value;
}
function from_candid_variant_n28(_uploadFile, _downloadFile, value) {
  return "active" in value ? "active" : "ringing" in value ? "ringing" : "missed" in value ? "missed" : "ended" in value ? "ended" : "declined" in value ? "declined" : value;
}
function from_candid_variant_n36(_uploadFile, _downloadFile, value) {
  return "d7" in value ? "d7" : "h24" in value ? "h24" : "off" in value ? "off" : value;
}
function from_candid_variant_n48(_uploadFile, _downloadFile, value) {
  return "read" in value ? "read" : "sent" in value ? "sent" : "sending" in value ? "sending" : "delivered" in value ? "delivered" : value;
}
function from_candid_variant_n64(_uploadFile, _downloadFile, value) {
  return "incomingCall" in value ? "incomingCall" : "groupInvite" in value ? "groupInvite" : "storyReply" in value ? "storyReply" : "like" in value ? "like" : "postReaction" in value ? "postReaction" : "comment" in value ? "comment" : "message" in value ? "message" : "missedCall" in value ? "missedCall" : "follow" in value ? "follow" : value;
}
function from_candid_vec_n10(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_UserProfileView_n11(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n29(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_StoryView_n23(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n32(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_CallView_n25(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n37(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_CommentView_n2(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n38(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Conversation_n39(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n41(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_GroupChatView_n7(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n44(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_GroupMessageView_n45(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n51(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_PostView_n17(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n54(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_MessageView_n55(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n60(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_NotificationView_n61(_uploadFile, _downloadFile, x));
}
function to_candid_CallStatus_n66(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n67(_uploadFile, _downloadFile, value);
}
function to_candid_ChatSettings_n68(_uploadFile, _downloadFile, value) {
  return to_candid_record_n69(_uploadFile, _downloadFile, value);
}
function to_candid_CreateGroupInput_n5(_uploadFile, _downloadFile, value) {
  return to_candid_record_n6(_uploadFile, _downloadFile, value);
}
function to_candid_CreatePostInput_n13(_uploadFile, _downloadFile, value) {
  return to_candid_record_n14(_uploadFile, _downloadFile, value);
}
function to_candid_CreateStoryInput_n21(_uploadFile, _downloadFile, value) {
  return to_candid_record_n22(_uploadFile, _downloadFile, value);
}
function to_candid_DisappearingMode_n70(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n71(_uploadFile, _downloadFile, value);
}
function to_candid_PostVisibility_n15(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n16(_uploadFile, _downloadFile, value);
}
function to_candid_UpsertProfileInput_n72(_uploadFile, _downloadFile, value) {
  return to_candid_record_n73(_uploadFile, _downloadFile, value);
}
function to_candid_opt_n1(_uploadFile, _downloadFile, value) {
  return value === null ? candid_none() : candid_some(value);
}
function to_candid_record_n14(_uploadFile, _downloadFile, value) {
  return {
    moodTag: value.moodTag ? candid_some(value.moodTag) : candid_none(),
    mediaUrl: value.mediaUrl ? candid_some(value.mediaUrl) : candid_none(),
    caption: value.caption,
    visibility: to_candid_PostVisibility_n15(_uploadFile, _downloadFile, value.visibility)
  };
}
function to_candid_record_n22(_uploadFile, _downloadFile, value) {
  return {
    moodTag: value.moodTag ? candid_some(value.moodTag) : candid_none(),
    mediaUrl: value.mediaUrl ? candid_some(value.mediaUrl) : candid_none(),
    caption: value.caption ? candid_some(value.caption) : candid_none()
  };
}
function to_candid_record_n6(_uploadFile, _downloadFile, value) {
  return {
    name: value.name,
    avatarUrl: value.avatarUrl ? candid_some(value.avatarUrl) : candid_none(),
    memberIds: value.memberIds
  };
}
function to_candid_record_n69(_uploadFile, _downloadFile, value) {
  return {
    wallpaper: value.wallpaper ? candid_some(value.wallpaper) : candid_none(),
    isArchived: value.isArchived,
    muteUntil: value.muteUntil ? candid_some(value.muteUntil) : candid_none(),
    bubbleColorReceived: value.bubbleColorReceived ? candid_some(value.bubbleColorReceived) : candid_none(),
    isMuted: value.isMuted,
    disappearingMode: to_candid_DisappearingMode_n70(_uploadFile, _downloadFile, value.disappearingMode),
    chatName: value.chatName ? candid_some(value.chatName) : candid_none(),
    bubbleColorSent: value.bubbleColorSent ? candid_some(value.bubbleColorSent) : candid_none()
  };
}
function to_candid_record_n73(_uploadFile, _downloadFile, value) {
  return {
    bio: value.bio,
    username: value.username,
    displayName: value.displayName,
    avatarUrl: value.avatarUrl ? candid_some(value.avatarUrl) : candid_none(),
    coverUrl: value.coverUrl ? candid_some(value.coverUrl) : candid_none()
  };
}
function to_candid_variant_n16(_uploadFile, _downloadFile, value) {
  return value == "everyone" ? {
    everyone: null
  } : value == "followers" ? {
    followers: null
  } : value;
}
function to_candid_variant_n67(_uploadFile, _downloadFile, value) {
  return value == "active" ? {
    active: null
  } : value == "ringing" ? {
    ringing: null
  } : value == "missed" ? {
    missed: null
  } : value == "ended" ? {
    ended: null
  } : value == "declined" ? {
    declined: null
  } : value;
}
function to_candid_variant_n71(_uploadFile, _downloadFile, value) {
  return value == "d7" ? {
    d7: null
  } : value == "h24" ? {
    h24: null
  } : value == "off" ? {
    off: null
  } : value;
}
function createActor(canisterId, _uploadFile, _downloadFile, options = {}) {
  const agent = options.agent || HttpAgent.createSync({
    ...options.agentOptions
  });
  if (options.agent && options.agentOptions) {
    console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.");
  }
  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions
  });
  return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
function useBackendActor() {
  return useActor(createActor);
}
function useMyProfile() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching
  });
}
function useUserProfile(userId) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProfile(userId);
    },
    enabled: !!actor && !isFetching
  });
}
function useSearchUsers(query) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      if (!actor || !query.trim()) return [];
      return actor.searchUsers(query.trim());
    },
    enabled: !!actor && !isFetching && query.trim().length > 0
  });
}
function useSuggestedUsers() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSuggestedUsers();
    },
    enabled: !!actor && !isFetching
  });
}
function useFollowUser() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (targetId) => {
      if (!actor) throw new Error("No actor");
      return actor.follow(targetId);
    },
    onSuccess: (_data, targetId) => {
      qc.invalidateQueries({ queryKey: ["isFollowing", targetId] });
      qc.invalidateQueries({ queryKey: ["followers"] });
      qc.invalidateQueries({ queryKey: ["following"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["suggestedUsers"] });
    }
  });
}
function useUnfollowUser() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (targetId) => {
      if (!actor) throw new Error("No actor");
      return actor.unfollow(targetId);
    },
    onSuccess: (_data, targetId) => {
      qc.invalidateQueries({ queryKey: ["isFollowing", targetId] });
      qc.invalidateQueries({ queryKey: ["followers"] });
      qc.invalidateQueries({ queryKey: ["following"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["suggestedUsers"] });
    }
  });
}
function useIsFollowing(userId) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["isFollowing", userId],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isFollowing(userId);
    },
    enabled: !!actor && !isFetching
  });
}
function useHomeFeed() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["homeFeed"],
    queryFn: async () => {
      if (!actor) return [];
      const page = await actor.getHomeFeed(null);
      return page.items;
    },
    enabled: !!actor && !isFetching
  });
}
function useUserPosts(userId) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["userPosts", userId],
    queryFn: async () => {
      if (!actor) return [];
      const page = await actor.getUserPosts(userId, null);
      return page.items;
    },
    enabled: !!actor && !isFetching
  });
}
function useTrendingPosts() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["trendingPosts"],
    queryFn: async () => {
      if (!actor) return [];
      const page = await actor.getTrendingPosts(null);
      return page.items;
    },
    enabled: !!actor && !isFetching
  });
}
function useCreatePost() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      if (!actor) throw new Error("No actor");
      return actor.createPost({
        caption: params.caption,
        mediaUrl: params.mediaUrl,
        moodTag: params.moodTag,
        visibility: params.visibility ?? "everyone"
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homeFeed"] });
      qc.invalidateQueries({ queryKey: ["trendingPosts"] });
    }
  });
}
function useCreateStory() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      if (!actor) throw new Error("No actor");
      return actor.createStory({
        mediaUrl: params.mediaUrl,
        moodTag: params.moodTag,
        caption: params.caption
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeStories"] });
    }
  });
}
function useActiveStories() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["activeStories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveStories();
    },
    enabled: !!actor && !isFetching
  });
}
function useSendMessage() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      if (!actor) throw new Error("No actor");
      return actor.sendMessage(
        params.toId,
        params.content,
        params.mediaUrl ?? null,
        params.replyToId ?? null
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.toId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}
function useConversations() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversations();
    },
    enabled: !!actor && !isFetching
  });
}
function useMessages(userId) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["messages", userId],
    queryFn: async () => {
      if (!actor) return [];
      const page = await actor.getMessages(userId, null);
      return page.items;
    },
    enabled: !!actor && !isFetching
  });
}
function useMarkAsRead() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (otherUserId) => {
      if (!actor) throw new Error("No actor");
      return actor.markAsRead(otherUserId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}
function useNotifications() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      const page = await actor.getNotifications(null);
      return page.items;
    },
    enabled: !!actor && !isFetching
  });
}
function useMarkAllNotificationsRead() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.markAllNotificationsRead();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    }
  });
}
function useGroupChats() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["groupChats"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGroupChats();
    },
    enabled: !!actor && !isFetching
  });
}
function useCreateGroup() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      if (!actor) throw new Error("No actor");
      return actor.createGroup({
        name: params.name,
        avatarUrl: params.avatarUrl,
        memberIds: params.memberIds
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    }
  });
}
function useGroupMessages(groupId) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["groupMessages", groupId],
    queryFn: async () => {
      if (!actor) return [];
      const page = await actor.getGroupMessages(groupId, null);
      return page.items;
    },
    enabled: !!actor && !isFetching
  });
}
function useSendGroupMessage() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      if (!actor) throw new Error("No actor");
      return actor.sendGroupMessage(
        params.groupId,
        params.content,
        params.mediaUrl ?? null,
        params.replyToId ?? null
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["groupMessages", vars.groupId] });
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    }
  });
}
function useAddGroupMember() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      if (!actor) throw new Error("No actor");
      return actor.addGroupMember(params.groupId, params.userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    }
  });
}
function useRemoveGroupMember() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      if (!actor) throw new Error("No actor");
      return actor.removeGroupMember(params.groupId, params.userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    }
  });
}
function usePromoteGroupAdmin() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      if (!actor) throw new Error("No actor");
      return actor.promoteGroupAdmin(params.groupId, params.userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    }
  });
}
function useDemoteGroupAdmin() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      if (!actor) throw new Error("No actor");
      return actor.demoteGroupAdmin(params.groupId, params.userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    }
  });
}
function useUpdateGroupInfo() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      if (!actor) throw new Error("No actor");
      return actor.updateGroupInfo(
        params.groupId,
        params.name ?? null,
        params.avatarUrl ?? null
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    }
  });
}
function useLeaveGroup() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (groupId) => {
      if (!actor) throw new Error("No actor");
      return actor.leaveGroup(groupId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    }
  });
}
function useDeleteGroup() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (groupId) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteGroup(groupId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    }
  });
}
function useReactToPost() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      if (!actor) throw new Error("No actor");
      return actor.reactToPost(params.postId, params.emoji);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["homeFeed"] });
      qc.invalidateQueries({ queryKey: ["userPosts"] });
      qc.invalidateQueries({ queryKey: ["trendingPosts"] });
      qc.invalidateQueries({ queryKey: ["post", vars.postId] });
      qc.invalidateQueries({ queryKey: ["postReactions", vars.postId] });
    }
  });
}
function useRemovePostReaction() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId) => {
      if (!actor) throw new Error("No actor");
      return actor.removePostReaction(postId);
    },
    onSuccess: (_data, postId) => {
      qc.invalidateQueries({ queryKey: ["homeFeed"] });
      qc.invalidateQueries({ queryKey: ["userPosts"] });
      qc.invalidateQueries({ queryKey: ["trendingPosts"] });
      qc.invalidateQueries({ queryKey: ["post", postId] });
      qc.invalidateQueries({ queryKey: ["postReactions", postId] });
    }
  });
}
function usePostReactions(postId) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["postReactions", postId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPostReactions(postId);
    },
    enabled: !!actor && !isFetching
  });
}
function useStartCall() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recipientId) => {
      if (!actor) throw new Error("No actor");
      return actor.startCall(recipientId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callHistory"] });
    }
  });
}
function useEndCall() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (callId) => {
      if (!actor) throw new Error("No actor");
      return actor.endCall(callId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callHistory"] });
    }
  });
}
function useUpdateCallStatus() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      if (!actor) throw new Error("No actor");
      return actor.updateCallStatus(params.callId, params.status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callHistory"] });
    }
  });
}
export {
  useRemoveGroupMember as A,
  usePromoteGroupAdmin as B,
  useDemoteGroupAdmin as C,
  useUpdateGroupInfo as D,
  useLeaveGroup as E,
  useDeleteGroup as F,
  useUserPosts as G,
  useUserProfile as H,
  useNotifications as I,
  useMarkAllNotificationsRead as J,
  useRemovePostReaction as a,
  usePostReactions as b,
  useHomeFeed as c,
  useActiveStories as d,
  useTrendingPosts as e,
  useSuggestedUsers as f,
  useIsFollowing as g,
  useFollowUser as h,
  useUnfollowUser as i,
  useCreatePost as j,
  useCreateStory as k,
  useConversations as l,
  useEndCall as m,
  useUpdateCallStatus as n,
  useMessages as o,
  useSendMessage as p,
  useMarkAsRead as q,
  useStartCall as r,
  useMyProfile as s,
  useGroupChats as t,
  useReactToPost as u,
  useCreateGroup as v,
  useSearchUsers as w,
  useGroupMessages as x,
  useSendGroupMessage as y,
  useAddGroupMember as z
};
