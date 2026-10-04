import Link from "next/link";
import { Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <h1 className="text-2xl font-bold text-brand">ບໍ່ພົບໜ້ານີ້ · Page not found</h1>
      <p className="mt-6">
        <Link href="/lo" className="font-semibold text-leaf hover:underline">ກັບໜ້າຫຼັກ</Link>
        {" · "}
        <Link href="/en" className="font-semibold text-leaf hover:underline">Back to home</Link>
      </p>
    </Container>
  );
}
