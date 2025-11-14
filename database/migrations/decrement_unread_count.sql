-- Function to decrement unread count on a conversation
CREATE OR REPLACE FUNCTION decrement_unread_count(conv_id uuid, col_name text, decrement_value int)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE conversations SET %I = GREATEST(0, %I - %s) WHERE id = %L',
    col_name, col_name, decrement_value, conv_id);
END;
$$ LANGUAGE plpgsql;
