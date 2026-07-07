import { permanentRedirect } from "next/navigation";

export default function StoriesPage() {
  permanentRedirect("/journal");
}
