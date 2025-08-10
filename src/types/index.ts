export interface Board {
    id: number
    title: string
    type: BoardType
    isActive?: boolean
    backgroundImg?: string
    fontFamily?: string
    backgroundColor?: string
    titleColor?: string
    openDate?: Date
    bgMusic?: string
    postColors?: string
    backgroundVideo?: string
    bgMusicExtension?: string
    createdAt: Date
    updatedAt: Date
    posts?: Post[]
}

export interface Post {
    id: number
    boardId: number
    message?: string
    nickname?: string
    email?: string
    imagePath?: string
    status: PostStatus
    createdAt: Date
    updatedAt: Date
    board?: Board
}

export interface User {
    id: number
    username: string
    email: string
    password: string
    createdAt: Date
    updatedAt: Date
}

export enum BoardType {
    FLYING_MESSAGES = 'FLYING_MESSAGES',
    POST_IT = 'POST_IT',
    NEWYEAR = 'NEWYEAR',
    NEWYEAR_RABBIT = 'NEWYEAR_RABBIT',
}

export enum PostStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export interface CreatePostData {
    message?: string
    nickname?: string
    email?: string
    boardId: number
}

export interface CreateBoardData {
    title: string
    type: BoardType
    backgroundImg?: string
    fontFamily?: string
    backgroundColor?: string
    titleColor?: string
    bgMusic?: string
    postColors?: string
    backgroundVideo?: string
    bgMusicExtension?: string
}

export interface WebSocketMessage {
    type: 'NEW_POST' | 'POST_STATUS_UPDATED' | 'NEW_APPROVED_POST' | 'BOARD_UPDATE' | 'REQUEST_POSTS'
    data?: Post | Board | unknown
}
