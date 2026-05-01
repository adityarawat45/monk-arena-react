-- 1. Add score tracking columns to your tables
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS total_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS started_tracking_on DATE;

ALTER TABLE public.daily_logs
ADD COLUMN IF NOT EXISTS score NUMERIC DEFAULT 0;

-- 2. Fully replace the confirm_streak RPC to strictly calculate and save scores
CREATE OR REPLACE FUNCTION public.confirm_streak(
  p_workout_minutes INTEGER DEFAULT 0,
  p_steps_walked INTEGER DEFAULT 0,
  p_study_hours NUMERIC DEFAULT 0
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_today date := current_date;
  v_score NUMERIC;
  v_old_score NUMERIC;
  v_score_diff NUMERIC;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Calculate the new points earned for today
  v_score := p_workout_minutes + (p_steps_walked / 100.0) + (p_study_hours * 20.0);

  -- Check if they already logged earlier today to prevent double counting
  SELECT score INTO v_old_score 
  FROM public.daily_logs 
  WHERE user_id = v_user_id AND log_date = v_today;
  
  IF v_old_score IS NULL THEN
     v_old_score := 0;
  END IF;

  v_score_diff := v_score - v_old_score;

  -- Insert or update the daily log with the new habits and the raw calculated score
  INSERT INTO public.daily_logs (user_id, log_date, status, workout_minutes, steps_walked, study_hours, score)
  VALUES (v_user_id, v_today, 'confirmed', p_workout_minutes, p_steps_walked, p_study_hours, v_score)
  ON CONFLICT (user_id, log_date) 
  DO UPDATE SET 
    status = 'confirmed',
    workout_minutes = p_workout_minutes,
    steps_walked = p_steps_walked,
    study_hours = p_study_hours,
    score = v_score;

  -- Add the new points directly to their profile's total score sum!
  UPDATE public.profiles
  SET 
    total_score = COALESCE(total_score, 0) + v_score_diff,
    started_tracking_on = COALESCE(started_tracking_on, v_today)
  WHERE id = v_user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
