-- Add member_id column to profiles
ALTER TABLE profiles ADD COLUMN member_id text UNIQUE;

-- Create helper function to generate the next unique member ID
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
  -- Generate initials (e.g. "Swapboard" -> "SW")
  v_words := regexp_split_to_array(trim(p_org_name), '\s+');
  IF array_length(v_words, 1) >= 2 THEN
    v_initials := upper(substring(v_words[1] from 1 for 1) || substring(v_words[2] from 1 for 1));
  ELSE
    -- strip non-alphabetic characters
    v_initials := upper(substring(regexp_replace(p_org_name, '[^a-zA-Z]', '', 'g') from 1 for 2));
    IF length(v_initials) < 2 THEN
      v_initials := upper(substring(v_initials || 'XX' from 1 for 2));
    END IF;
  END IF;

  -- Count existing profiles in organization
  SELECT count(*) INTO v_count
  FROM profiles
  WHERE organization_id = p_org_id;

  v_next_num := v_count + 1;
  v_exists := true;

  -- Ensure uniqueness
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

-- Create trigger function to automatically generate member_id on onboarding completion
CREATE OR REPLACE FUNCTION trigger_generate_member_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.onboarding_complete = true AND NEW.member_id IS NULL AND NEW.organization_id IS NOT NULL THEN
    DECLARE
      v_org_name text;
    BEGIN
      SELECT name INTO v_org_name FROM organizations WHERE id = NEW.organization_id;
      NEW.member_id := generate_next_member_id(NEW.organization_id, v_org_name);
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER profiles_generate_member_id_trigger
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_member_id();

-- Create RPC function to look up email by member_id (called during login)
CREATE OR REPLACE FUNCTION get_email_by_member_id(p_member_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email
  from profiles
  WHERE lower(member_id) = lower(p_member_id);
  RETURN v_email;
END;
$$;
