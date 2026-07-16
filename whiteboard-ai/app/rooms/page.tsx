import RoomBoard from './RoomBoard';

type RoomsPageProps = {
    searchParams?: Promise<{ roomId?: string | string[] }>;
};

export default async function Page({ searchParams }: RoomsPageProps) {
    const params = searchParams ? await searchParams : undefined;
    const roomId = Array.isArray(params?.roomId) ? params?.roomId[0] : params?.roomId;

    return <RoomBoard roomId={roomId?.trim() || 'Board-1'} />;
}
