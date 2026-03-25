import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace tictactoe. */
export namespace tictactoe {

    /** OpCode enum. */
    enum OpCode {
        OPCODE_UNSPECIFIED = 0,
        OPCODE_MOVE = 1,
        OPCODE_STATE = 2,
        OPCODE_GAME_OVER = 3
    }

    /** Properties of a GameState. */
    interface IGameState {

        /** GameState board */
        board?: (number[]|null);

        /** GameState currentTurn */
        currentTurn?: (number|null);

        /** GameState turnStartTime */
        turnStartTime?: (number|Long|null);

        /** GameState winnerId */
        winnerId?: (string|null);

        /** GameState p1Id */
        p1Id?: (string|null);

        /** GameState p2Id */
        p2Id?: (string|null);

        /** GameState isTimedMode */
        isTimedMode?: (boolean|null);

        /** GameState p1TimeUsed */
        p1TimeUsed?: (number|Long|null);

        /** GameState p2TimeUsed */
        p2TimeUsed?: (number|Long|null);

        /** GameState p1DisconnectTime */
        p1DisconnectTime?: (number|Long|null);

        /** GameState p2DisconnectTime */
        p2DisconnectTime?: (number|Long|null);
    }

    /** Represents a GameState. */
    class GameState implements IGameState {

        /**
         * Constructs a new GameState.
         * @param [properties] Properties to set
         */
        constructor(properties?: tictactoe.IGameState);

        /** GameState board. */
        public board: number[];

        /** GameState currentTurn. */
        public currentTurn: number;

        /** GameState turnStartTime. */
        public turnStartTime: (number|Long);

        /** GameState winnerId. */
        public winnerId: string;

        /** GameState p1Id. */
        public p1Id: string;

        /** GameState p2Id. */
        public p2Id: string;

        /** GameState isTimedMode. */
        public isTimedMode: boolean;

        /** GameState p1TimeUsed. */
        public p1TimeUsed: (number|Long);

        /** GameState p2TimeUsed. */
        public p2TimeUsed: (number|Long);

        /** GameState p1DisconnectTime. */
        public p1DisconnectTime: (number|Long);

        /** GameState p2DisconnectTime. */
        public p2DisconnectTime: (number|Long);

        /**
         * Creates a new GameState instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GameState instance
         */
        public static create(properties?: tictactoe.IGameState): tictactoe.GameState;

        /**
         * Encodes the specified GameState message. Does not implicitly {@link tictactoe.GameState.verify|verify} messages.
         * @param message GameState message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tictactoe.IGameState, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GameState message, length delimited. Does not implicitly {@link tictactoe.GameState.verify|verify} messages.
         * @param message GameState message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tictactoe.IGameState, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GameState message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GameState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tictactoe.GameState;

        /**
         * Decodes a GameState message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GameState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tictactoe.GameState;

        /**
         * Verifies a GameState message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GameState message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GameState
         */
        public static fromObject(object: { [k: string]: any }): tictactoe.GameState;

        /**
         * Creates a plain object from a GameState message. Also converts values to other types if specified.
         * @param message GameState
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tictactoe.GameState, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GameState to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GameState
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a MoveRequest. */
    interface IMoveRequest {

        /** MoveRequest position */
        position?: (number|null);
    }

    /** Represents a MoveRequest. */
    class MoveRequest implements IMoveRequest {

        /**
         * Constructs a new MoveRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: tictactoe.IMoveRequest);

        /** MoveRequest position. */
        public position: number;

        /**
         * Creates a new MoveRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MoveRequest instance
         */
        public static create(properties?: tictactoe.IMoveRequest): tictactoe.MoveRequest;

        /**
         * Encodes the specified MoveRequest message. Does not implicitly {@link tictactoe.MoveRequest.verify|verify} messages.
         * @param message MoveRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tictactoe.IMoveRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MoveRequest message, length delimited. Does not implicitly {@link tictactoe.MoveRequest.verify|verify} messages.
         * @param message MoveRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tictactoe.IMoveRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MoveRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MoveRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tictactoe.MoveRequest;

        /**
         * Decodes a MoveRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MoveRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tictactoe.MoveRequest;

        /**
         * Verifies a MoveRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MoveRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MoveRequest
         */
        public static fromObject(object: { [k: string]: any }): tictactoe.MoveRequest;

        /**
         * Creates a plain object from a MoveRequest message. Also converts values to other types if specified.
         * @param message MoveRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tictactoe.MoveRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MoveRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MoveRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
