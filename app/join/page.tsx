import { permanentRedirect } from "next/navigation";

export default function JoinPage() {
  permanentRedirect("/contact#waitlist");
}
