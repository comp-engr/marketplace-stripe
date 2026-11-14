import { NotFoundView } from "@/components/marketplace/NotFoundView";

export default function ItemNotFound() {
  return (
    <NotFoundView
      title="This listing isn't available"
      message="It may have been removed, or the link might be wrong."
    />
  );
}
