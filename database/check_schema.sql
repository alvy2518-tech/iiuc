-- Check what columns actually exist in job_applications
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'job_applications' 
ORDER BY ordinal_position;
