/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const tictactoe = $root.tictactoe = (() => {

    /**
     * Namespace tictactoe.
     * @exports tictactoe
     * @namespace
     */
    const tictactoe = {};

    /**
     * OpCode enum.
     * @name tictactoe.OpCode
     * @enum {number}
     * @property {number} OPCODE_UNSPECIFIED=0 OPCODE_UNSPECIFIED value
     * @property {number} OPCODE_MOVE=1 OPCODE_MOVE value
     * @property {number} OPCODE_STATE=2 OPCODE_STATE value
     * @property {number} OPCODE_GAME_OVER=3 OPCODE_GAME_OVER value
     */
    tictactoe.OpCode = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "OPCODE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "OPCODE_MOVE"] = 1;
        values[valuesById[2] = "OPCODE_STATE"] = 2;
        values[valuesById[3] = "OPCODE_GAME_OVER"] = 3;
        return values;
    })();

    tictactoe.GameState = (function() {

        /**
         * Properties of a GameState.
         * @memberof tictactoe
         * @interface IGameState
         * @property {Array.<number>|null} [board] GameState board
         * @property {number|null} [currentTurn] GameState currentTurn
         * @property {number|Long|null} [turnStartTime] GameState turnStartTime
         * @property {string|null} [winnerId] GameState winnerId
         * @property {string|null} [p1Id] GameState p1Id
         * @property {string|null} [p2Id] GameState p2Id
         * @property {boolean|null} [isTimedMode] GameState isTimedMode
         * @property {number|Long|null} [p1TimeUsed] GameState p1TimeUsed
         * @property {number|Long|null} [p2TimeUsed] GameState p2TimeUsed
         */

        /**
         * Constructs a new GameState.
         * @memberof tictactoe
         * @classdesc Represents a GameState.
         * @implements IGameState
         * @constructor
         * @param {tictactoe.IGameState=} [properties] Properties to set
         */
        function GameState(properties) {
            this.board = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GameState board.
         * @member {Array.<number>} board
         * @memberof tictactoe.GameState
         * @instance
         */
        GameState.prototype.board = $util.emptyArray;

        /**
         * GameState currentTurn.
         * @member {number} currentTurn
         * @memberof tictactoe.GameState
         * @instance
         */
        GameState.prototype.currentTurn = 0;

        /**
         * GameState turnStartTime.
         * @member {number|Long} turnStartTime
         * @memberof tictactoe.GameState
         * @instance
         */
        GameState.prototype.turnStartTime = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * GameState winnerId.
         * @member {string} winnerId
         * @memberof tictactoe.GameState
         * @instance
         */
        GameState.prototype.winnerId = "";

        /**
         * GameState p1Id.
         * @member {string} p1Id
         * @memberof tictactoe.GameState
         * @instance
         */
        GameState.prototype.p1Id = "";

        /**
         * GameState p2Id.
         * @member {string} p2Id
         * @memberof tictactoe.GameState
         * @instance
         */
        GameState.prototype.p2Id = "";

        /**
         * GameState isTimedMode.
         * @member {boolean} isTimedMode
         * @memberof tictactoe.GameState
         * @instance
         */
        GameState.prototype.isTimedMode = false;

        /**
         * GameState p1TimeUsed.
         * @member {number|Long} p1TimeUsed
         * @memberof tictactoe.GameState
         * @instance
         */
        GameState.prototype.p1TimeUsed = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * GameState p2TimeUsed.
         * @member {number|Long} p2TimeUsed
         * @memberof tictactoe.GameState
         * @instance
         */
        GameState.prototype.p2TimeUsed = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new GameState instance using the specified properties.
         * @function create
         * @memberof tictactoe.GameState
         * @static
         * @param {tictactoe.IGameState=} [properties] Properties to set
         * @returns {tictactoe.GameState} GameState instance
         */
        GameState.create = function create(properties) {
            return new GameState(properties);
        };

        /**
         * Encodes the specified GameState message. Does not implicitly {@link tictactoe.GameState.verify|verify} messages.
         * @function encode
         * @memberof tictactoe.GameState
         * @static
         * @param {tictactoe.IGameState} message GameState message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameState.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.board != null && message.board.length) {
                writer.uint32(/* id 1, wireType 2 =*/10).fork();
                for (let i = 0; i < message.board.length; ++i)
                    writer.int32(message.board[i]);
                writer.ldelim();
            }
            if (message.currentTurn != null && Object.hasOwnProperty.call(message, "currentTurn"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.currentTurn);
            if (message.turnStartTime != null && Object.hasOwnProperty.call(message, "turnStartTime"))
                writer.uint32(/* id 3, wireType 0 =*/24).int64(message.turnStartTime);
            if (message.winnerId != null && Object.hasOwnProperty.call(message, "winnerId"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.winnerId);
            if (message.p1Id != null && Object.hasOwnProperty.call(message, "p1Id"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.p1Id);
            if (message.p2Id != null && Object.hasOwnProperty.call(message, "p2Id"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.p2Id);
            if (message.isTimedMode != null && Object.hasOwnProperty.call(message, "isTimedMode"))
                writer.uint32(/* id 7, wireType 0 =*/56).bool(message.isTimedMode);
            if (message.p1TimeUsed != null && Object.hasOwnProperty.call(message, "p1TimeUsed"))
                writer.uint32(/* id 8, wireType 0 =*/64).int64(message.p1TimeUsed);
            if (message.p2TimeUsed != null && Object.hasOwnProperty.call(message, "p2TimeUsed"))
                writer.uint32(/* id 9, wireType 0 =*/72).int64(message.p2TimeUsed);
            return writer;
        };

        /**
         * Encodes the specified GameState message, length delimited. Does not implicitly {@link tictactoe.GameState.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tictactoe.GameState
         * @static
         * @param {tictactoe.IGameState} message GameState message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameState.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GameState message from the specified reader or buffer.
         * @function decode
         * @memberof tictactoe.GameState
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tictactoe.GameState} GameState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameState.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tictactoe.GameState();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.board && message.board.length))
                            message.board = [];
                        if ((tag & 7) === 2) {
                            let end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.board.push(reader.int32());
                        } else
                            message.board.push(reader.int32());
                        break;
                    }
                case 2: {
                        message.currentTurn = reader.int32();
                        break;
                    }
                case 3: {
                        message.turnStartTime = reader.int64();
                        break;
                    }
                case 4: {
                        message.winnerId = reader.string();
                        break;
                    }
                case 5: {
                        message.p1Id = reader.string();
                        break;
                    }
                case 6: {
                        message.p2Id = reader.string();
                        break;
                    }
                case 7: {
                        message.isTimedMode = reader.bool();
                        break;
                    }
                case 8: {
                        message.p1TimeUsed = reader.int64();
                        break;
                    }
                case 9: {
                        message.p2TimeUsed = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GameState message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tictactoe.GameState
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tictactoe.GameState} GameState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameState.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GameState message.
         * @function verify
         * @memberof tictactoe.GameState
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GameState.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.board != null && message.hasOwnProperty("board")) {
                if (!Array.isArray(message.board))
                    return "board: array expected";
                for (let i = 0; i < message.board.length; ++i)
                    if (!$util.isInteger(message.board[i]))
                        return "board: integer[] expected";
            }
            if (message.currentTurn != null && message.hasOwnProperty("currentTurn"))
                if (!$util.isInteger(message.currentTurn))
                    return "currentTurn: integer expected";
            if (message.turnStartTime != null && message.hasOwnProperty("turnStartTime"))
                if (!$util.isInteger(message.turnStartTime) && !(message.turnStartTime && $util.isInteger(message.turnStartTime.low) && $util.isInteger(message.turnStartTime.high)))
                    return "turnStartTime: integer|Long expected";
            if (message.winnerId != null && message.hasOwnProperty("winnerId"))
                if (!$util.isString(message.winnerId))
                    return "winnerId: string expected";
            if (message.p1Id != null && message.hasOwnProperty("p1Id"))
                if (!$util.isString(message.p1Id))
                    return "p1Id: string expected";
            if (message.p2Id != null && message.hasOwnProperty("p2Id"))
                if (!$util.isString(message.p2Id))
                    return "p2Id: string expected";
            if (message.isTimedMode != null && message.hasOwnProperty("isTimedMode"))
                if (typeof message.isTimedMode !== "boolean")
                    return "isTimedMode: boolean expected";
            if (message.p1TimeUsed != null && message.hasOwnProperty("p1TimeUsed"))
                if (!$util.isInteger(message.p1TimeUsed) && !(message.p1TimeUsed && $util.isInteger(message.p1TimeUsed.low) && $util.isInteger(message.p1TimeUsed.high)))
                    return "p1TimeUsed: integer|Long expected";
            if (message.p2TimeUsed != null && message.hasOwnProperty("p2TimeUsed"))
                if (!$util.isInteger(message.p2TimeUsed) && !(message.p2TimeUsed && $util.isInteger(message.p2TimeUsed.low) && $util.isInteger(message.p2TimeUsed.high)))
                    return "p2TimeUsed: integer|Long expected";
            return null;
        };

        /**
         * Creates a GameState message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tictactoe.GameState
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tictactoe.GameState} GameState
         */
        GameState.fromObject = function fromObject(object) {
            if (object instanceof $root.tictactoe.GameState)
                return object;
            let message = new $root.tictactoe.GameState();
            if (object.board) {
                if (!Array.isArray(object.board))
                    throw TypeError(".tictactoe.GameState.board: array expected");
                message.board = [];
                for (let i = 0; i < object.board.length; ++i)
                    message.board[i] = object.board[i] | 0;
            }
            if (object.currentTurn != null)
                message.currentTurn = object.currentTurn | 0;
            if (object.turnStartTime != null)
                if ($util.Long)
                    (message.turnStartTime = $util.Long.fromValue(object.turnStartTime)).unsigned = false;
                else if (typeof object.turnStartTime === "string")
                    message.turnStartTime = parseInt(object.turnStartTime, 10);
                else if (typeof object.turnStartTime === "number")
                    message.turnStartTime = object.turnStartTime;
                else if (typeof object.turnStartTime === "object")
                    message.turnStartTime = new $util.LongBits(object.turnStartTime.low >>> 0, object.turnStartTime.high >>> 0).toNumber();
            if (object.winnerId != null)
                message.winnerId = String(object.winnerId);
            if (object.p1Id != null)
                message.p1Id = String(object.p1Id);
            if (object.p2Id != null)
                message.p2Id = String(object.p2Id);
            if (object.isTimedMode != null)
                message.isTimedMode = Boolean(object.isTimedMode);
            if (object.p1TimeUsed != null)
                if ($util.Long)
                    (message.p1TimeUsed = $util.Long.fromValue(object.p1TimeUsed)).unsigned = false;
                else if (typeof object.p1TimeUsed === "string")
                    message.p1TimeUsed = parseInt(object.p1TimeUsed, 10);
                else if (typeof object.p1TimeUsed === "number")
                    message.p1TimeUsed = object.p1TimeUsed;
                else if (typeof object.p1TimeUsed === "object")
                    message.p1TimeUsed = new $util.LongBits(object.p1TimeUsed.low >>> 0, object.p1TimeUsed.high >>> 0).toNumber();
            if (object.p2TimeUsed != null)
                if ($util.Long)
                    (message.p2TimeUsed = $util.Long.fromValue(object.p2TimeUsed)).unsigned = false;
                else if (typeof object.p2TimeUsed === "string")
                    message.p2TimeUsed = parseInt(object.p2TimeUsed, 10);
                else if (typeof object.p2TimeUsed === "number")
                    message.p2TimeUsed = object.p2TimeUsed;
                else if (typeof object.p2TimeUsed === "object")
                    message.p2TimeUsed = new $util.LongBits(object.p2TimeUsed.low >>> 0, object.p2TimeUsed.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a GameState message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tictactoe.GameState
         * @static
         * @param {tictactoe.GameState} message GameState
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GameState.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.board = [];
            if (options.defaults) {
                object.currentTurn = 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.turnStartTime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.turnStartTime = options.longs === String ? "0" : 0;
                object.winnerId = "";
                object.p1Id = "";
                object.p2Id = "";
                object.isTimedMode = false;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.p1TimeUsed = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.p1TimeUsed = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.p2TimeUsed = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.p2TimeUsed = options.longs === String ? "0" : 0;
            }
            if (message.board && message.board.length) {
                object.board = [];
                for (let j = 0; j < message.board.length; ++j)
                    object.board[j] = message.board[j];
            }
            if (message.currentTurn != null && message.hasOwnProperty("currentTurn"))
                object.currentTurn = message.currentTurn;
            if (message.turnStartTime != null && message.hasOwnProperty("turnStartTime"))
                if (typeof message.turnStartTime === "number")
                    object.turnStartTime = options.longs === String ? String(message.turnStartTime) : message.turnStartTime;
                else
                    object.turnStartTime = options.longs === String ? $util.Long.prototype.toString.call(message.turnStartTime) : options.longs === Number ? new $util.LongBits(message.turnStartTime.low >>> 0, message.turnStartTime.high >>> 0).toNumber() : message.turnStartTime;
            if (message.winnerId != null && message.hasOwnProperty("winnerId"))
                object.winnerId = message.winnerId;
            if (message.p1Id != null && message.hasOwnProperty("p1Id"))
                object.p1Id = message.p1Id;
            if (message.p2Id != null && message.hasOwnProperty("p2Id"))
                object.p2Id = message.p2Id;
            if (message.isTimedMode != null && message.hasOwnProperty("isTimedMode"))
                object.isTimedMode = message.isTimedMode;
            if (message.p1TimeUsed != null && message.hasOwnProperty("p1TimeUsed"))
                if (typeof message.p1TimeUsed === "number")
                    object.p1TimeUsed = options.longs === String ? String(message.p1TimeUsed) : message.p1TimeUsed;
                else
                    object.p1TimeUsed = options.longs === String ? $util.Long.prototype.toString.call(message.p1TimeUsed) : options.longs === Number ? new $util.LongBits(message.p1TimeUsed.low >>> 0, message.p1TimeUsed.high >>> 0).toNumber() : message.p1TimeUsed;
            if (message.p2TimeUsed != null && message.hasOwnProperty("p2TimeUsed"))
                if (typeof message.p2TimeUsed === "number")
                    object.p2TimeUsed = options.longs === String ? String(message.p2TimeUsed) : message.p2TimeUsed;
                else
                    object.p2TimeUsed = options.longs === String ? $util.Long.prototype.toString.call(message.p2TimeUsed) : options.longs === Number ? new $util.LongBits(message.p2TimeUsed.low >>> 0, message.p2TimeUsed.high >>> 0).toNumber() : message.p2TimeUsed;
            return object;
        };

        /**
         * Converts this GameState to JSON.
         * @function toJSON
         * @memberof tictactoe.GameState
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GameState.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GameState
         * @function getTypeUrl
         * @memberof tictactoe.GameState
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GameState.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tictactoe.GameState";
        };

        return GameState;
    })();

    tictactoe.MoveRequest = (function() {

        /**
         * Properties of a MoveRequest.
         * @memberof tictactoe
         * @interface IMoveRequest
         * @property {number|null} [position] MoveRequest position
         */

        /**
         * Constructs a new MoveRequest.
         * @memberof tictactoe
         * @classdesc Represents a MoveRequest.
         * @implements IMoveRequest
         * @constructor
         * @param {tictactoe.IMoveRequest=} [properties] Properties to set
         */
        function MoveRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MoveRequest position.
         * @member {number} position
         * @memberof tictactoe.MoveRequest
         * @instance
         */
        MoveRequest.prototype.position = 0;

        /**
         * Creates a new MoveRequest instance using the specified properties.
         * @function create
         * @memberof tictactoe.MoveRequest
         * @static
         * @param {tictactoe.IMoveRequest=} [properties] Properties to set
         * @returns {tictactoe.MoveRequest} MoveRequest instance
         */
        MoveRequest.create = function create(properties) {
            return new MoveRequest(properties);
        };

        /**
         * Encodes the specified MoveRequest message. Does not implicitly {@link tictactoe.MoveRequest.verify|verify} messages.
         * @function encode
         * @memberof tictactoe.MoveRequest
         * @static
         * @param {tictactoe.IMoveRequest} message MoveRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MoveRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.position);
            return writer;
        };

        /**
         * Encodes the specified MoveRequest message, length delimited. Does not implicitly {@link tictactoe.MoveRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tictactoe.MoveRequest
         * @static
         * @param {tictactoe.IMoveRequest} message MoveRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MoveRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MoveRequest message from the specified reader or buffer.
         * @function decode
         * @memberof tictactoe.MoveRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tictactoe.MoveRequest} MoveRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MoveRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tictactoe.MoveRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.position = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MoveRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tictactoe.MoveRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tictactoe.MoveRequest} MoveRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MoveRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MoveRequest message.
         * @function verify
         * @memberof tictactoe.MoveRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MoveRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.position != null && message.hasOwnProperty("position"))
                if (!$util.isInteger(message.position))
                    return "position: integer expected";
            return null;
        };

        /**
         * Creates a MoveRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tictactoe.MoveRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tictactoe.MoveRequest} MoveRequest
         */
        MoveRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.tictactoe.MoveRequest)
                return object;
            let message = new $root.tictactoe.MoveRequest();
            if (object.position != null)
                message.position = object.position | 0;
            return message;
        };

        /**
         * Creates a plain object from a MoveRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tictactoe.MoveRequest
         * @static
         * @param {tictactoe.MoveRequest} message MoveRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MoveRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.position = 0;
            if (message.position != null && message.hasOwnProperty("position"))
                object.position = message.position;
            return object;
        };

        /**
         * Converts this MoveRequest to JSON.
         * @function toJSON
         * @memberof tictactoe.MoveRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MoveRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MoveRequest
         * @function getTypeUrl
         * @memberof tictactoe.MoveRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MoveRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tictactoe.MoveRequest";
        };

        return MoveRequest;
    })();

    return tictactoe;
})();

export { $root as default };
