import { permanentRedirect } from "next/navigation";

export default function PressPage() {
  permanentRedirect("/journal");
}
