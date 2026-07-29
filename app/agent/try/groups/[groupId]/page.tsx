import { FitMeetCompleteExperience } from '@/components/fitmeet-app/FitMeetCompleteExperience';

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  return (
    <FitMeetCompleteExperience
      initialDestination="home"
      initialExperience="group"
      initialEntityId={decodeURIComponent(groupId)}
    />
  );
}
