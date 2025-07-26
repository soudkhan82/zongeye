import { Button } from "@/components/ui/button";

import Link from "next/link";

export default function HomePge() {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center bg-gray-200 py-5 px-20">
        <h1 className="font-bold text-2xl">Zong EYE</h1>
        <Button>
          <Link href="/login">Login</Link>
        </Button>
      </div>
      <div className="bg-white lg:grid-cols-2 grid-cols-1">
        <div className="col-span-1">
          <div>
            <h1>Welcome to NOMC Analytics </h1>
            <p>
              A platform for end-end Project Management and Performance
              Management
            </p>
            <Button>Enter</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
