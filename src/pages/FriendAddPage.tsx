import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resolveFriendCode } from "@/services/socialService";
import AddFriendModal from "@/components/shared/AddFriendModal";

export default function FriendAddPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const [resolvedUsername, setResolvedUsername] = useState<string | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!code) {
      navigate("/contest", { replace: true });
      return;
    }
    resolveFriendCode(code).then((result) => {
      if (result) {
        setResolvedUsername(result.username);
        setIsOpen(true);
      } else {
        navigate("/contest", { replace: true });
      }
    });
  }, [code, navigate]);

  return (
    <div className="px-5 pt-8 pb-4">
      <AddFriendModal
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); navigate("/contest", { replace: true }); }}
        initialSearch={resolvedUsername}
      />
    </div>
  );
}
