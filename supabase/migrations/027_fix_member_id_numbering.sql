-- Fix member_id numbering so the org admin correctly receives 001
-- instead of 002. The bug was v_count + 1: when the admin's onboarding
-- completes, count() already sees their own profile (1 row), so the
-- result was 1+1=2. Changing to v_count makes it 1+0=1 ... wait,
-- actually the fix is: the first member should get number equal to
-- the count of members who already HAVE a member_id plus 1.
-- That way the admin (0 assigned IDs so far) gets 001,
-- next worker (1 assigned ID so far) gets 002, etc.

CREATE OR REPLACE FUNCTION generate_next_member_id(p_org_id uuid, p_org_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_initials text;
  v_count integer;
  v_next_num integer;
  v_member_id text;
  v_exists boolean;
  v_words text[];
BEGIN
  -- Generate initials (e.g. "Burger King" -> "BK", "Swapboard" -> "SW")
  v_words := regexp_split_to_array(trim(p_org_name), '\s+');
  IF array_length(v_words, 1) >= 2 THEN
    v_initials := upper(substring(v_words[1] from 1 for 1) || substring(v_words[2] from 1 for 1));
  ELSE
    v_initials := upper(substring(regexp_replace(p_org_name, '[^a-zA-Z]', '', 'g') from 1 for 2));
    IF length(v_initials) < 2 THEN
      v_initials := upper(substring(v_initials || 'XX' from 1 for 2));
    END IF;
  END IF;

  -- Count profiles in this org that already HAVE a member_id assigned.
  -- This means the admin (first to complete onboarding, 0 assigned so far)
  -- gets v_count+1 = 0+1 = 001. The next worker gets 1+1 = 002, etc.
  SELECT count(*) INTO v_count
  FROM profiles
  WHERE organization_id = p_org_id
    AND member_id IS NOT NULL;

  v_next_num := v_count + 1;
  v_exists := true;

  -- Ensure uniqueness (guard against any collisions)
  WHILE v_exists LOOP
    v_member_id := v_initials || lpad(v_next_num::text, 3, '0');
    SELECT exists(
      SELECT 1 FROM profiles WHERE member_id = v_member_id
    ) INTO v_exists;
    IF v_exists THEN
      v_next_num := v_next_num + 1;
    END IF;
  END LOOP;

  RETURN v_member_id;
END;
$$;
