/**
 * @trace/protocol — the contract between the Trace engine and every surface.
 *
 * Import from here, never from a deep path: the subfile layout is an
 * implementation detail and will move.
 *
 * Copyright (c) 2026 Origin AI
 */

export {
  PROTOCOL_VERSION,
  ErrorCode,
  RpcError,
  isJsonRpcRequest,
  isJsonRpcNotification,
  isJsonRpcResponse,
  isJsonRpcErrorResponse,
} from "./jsonrpc.js";
export type {
  ErrorCodeValue,
  JsonRpcId,
  JsonRpcRequest,
  JsonRpcNotification,
  JsonRpcSuccessResponse,
  JsonRpcErrorPayload,
  JsonRpcErrorResponse,
  JsonRpcResponse,
  JsonRpcMessage,
} from "./jsonrpc.js";

export { FrameDecoder, FrameTooLargeError, MAX_FRAME_BYTES, encodeFrame } from "./framing.js";
export type { DecodedFrame, FrameParseFailure } from "./framing.js";

export { RpcPeer } from "./peer.js";
export type {
  Transport,
  RequestOptions,
  RequestHandler,
  NotificationHandler,
  RpcPeerOptions,
  EngineRequestHandlers,
  EngineNotifications,
} from "./peer.js";

export {
  TOOL_NAMES,
  TOOL_EFFECTS,
  DEFAULT_PERMISSION_SETTINGS,
  isToolName,
} from "./tools.js";
export type {
  ToolName,
  ToolEffect,
  ToolInputMap,
  ReadFileInput,
  ListDirInput,
  GlobInput,
  GrepInput,
  CodebaseSearchInput,
  WriteFileInput,
  EditFileInput,
  DeleteFileInput,
  RunTerminalCmdInput,
  TodoItem,
  TodoStatus,
  TodoWriteInput,
  FetchRulesInput,
  PermissionMode,
  PermissionRule,
  PermissionSettings,
  PermissionRequest,
  PermissionDecision,
} from "./tools.js";

export type {
  SessionEvent,
  SessionEventType,
  EventOf,
  WorkPanelTarget,
  StopReason,
  TokenUsage,
  TurnCost,
  FileChangeSummary,
} from "./events.js";

export type {
  RequestMap,
  RequestMethod,
  ParamsOf,
  ResultOf,
  NotificationMap,
  NotificationMethod,
  NotificationParamsOf,
  ClientInfo,
  InitializeParams,
  InitializeResult,
  WorkspaceInfo,
  SessionSummary,
  TranscriptEntry,
  Attachment,
  CreateSessionParams,
  PromptParams,
  PromptResult,
  DirEntry,
  SearchMatch,
  FileCandidate,
  PromptCommand,
  RuleActivation,
  RuleSummary,
  GitFileStatus,
  GitStatusResult,
  EngineSettings,
  SetProviderKeyParams,
  ProviderKeyStatus,
  ModelInfo,
} from "./methods.js";
