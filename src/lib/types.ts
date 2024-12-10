 
export type Packet = Shard[]

export enum Shard_Types {
    SET_DATA_VALUE, // S -> C
    CREATE_INPUT, // S -> C
    SET_ID, // S -> C

    INPUT_VALUE // C -> S
}

export type Shard = {
    type: Shard_Types,
    data: any
}

// Specific -----------------------------------------------
