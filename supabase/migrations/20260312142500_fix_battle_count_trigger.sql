-- Update the sync_emcee_battle_count function to handle UPDATES
-- This is crucial for correctly tracking counts during emcee merges
CREATE OR REPLACE FUNCTION public.sync_emcee_battle_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.emcees SET battle_count = battle_count + 1 WHERE id = NEW.emcee_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.emcees SET battle_count = battle_count - 1 WHERE id = OLD.emcee_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.emcee_id != NEW.emcee_id) THEN
            UPDATE public.emcees SET battle_count = battle_count - 1 WHERE id = OLD.emcee_id;
            UPDATE public.emcees SET battle_count = battle_count + 1 WHERE id = NEW.emcee_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger also fires on UPDATE
DROP TRIGGER IF EXISTS tr_sync_emcee_battle_count ON public.battle_participants;
CREATE TRIGGER tr_sync_emcee_battle_count
AFTER INSERT OR DELETE OR UPDATE ON public.battle_participants
FOR EACH ROW EXECUTE FUNCTION public.sync_emcee_battle_count();

-- One-time fix: Recalculate battle counts for all emcees to catch up with previous merges
UPDATE public.emcees e
SET battle_count = (
    SELECT count(*)
    FROM public.battle_participants bp
    JOIN public.battles b ON bp.battle_id = b.id
    WHERE bp.emcee_id = e.id AND b.status != 'excluded'
);
