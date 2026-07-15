-- Claim invitation tokens atomically before creating an auth user. This
-- prevents concurrent acceptance requests from creating multiple accounts.
ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS claim_token uuid,
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

CREATE OR REPLACE FUNCTION claim_invitation(p_token text)
RETURNS SETOF invitations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE invitations
  SET claim_token = gen_random_uuid(),
      claimed_at = now()
  WHERE token = trim(p_token)
    AND accepted_at IS NULL
    AND expires_at > now()
    -- A stale claim is recoverable if the request failed before completion.
    AND (claim_token IS NULL OR claimed_at < now() - interval '15 minutes')
  RETURNING invitations.*;
END;
$$;

CREATE OR REPLACE FUNCTION complete_invitation_claim(
  p_invitation_id uuid,
  p_claim_token uuid,
  p_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE invitations
  SET accepted_at = now(),
      email = lower(trim(p_email)),
      claim_token = NULL,
      claimed_at = NULL
  WHERE id = p_invitation_id
    AND claim_token = p_claim_token
    AND accepted_at IS NULL;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION release_invitation_claim(
  p_invitation_id uuid,
  p_claim_token uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE invitations
  SET claim_token = NULL,
      claimed_at = NULL
  WHERE id = p_invitation_id
    AND claim_token = p_claim_token
    AND accepted_at IS NULL;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION claim_invitation(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION complete_invitation_claim(uuid, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION release_invitation_claim(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION claim_invitation(text) TO service_role;
GRANT EXECUTE ON FUNCTION complete_invitation_claim(uuid, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION release_invitation_claim(uuid, uuid) TO service_role;
