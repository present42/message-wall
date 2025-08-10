import BoardForm from '@/components/admin/board-form'

interface EditBoardPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditBoardPage({ params }: EditBoardPageProps) {
    const { id } = await params
    return <BoardForm boardId={id} />
}
