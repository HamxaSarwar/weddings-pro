# Row Level Security Policy Fixes

## Issue
RSVP submissions were failing with error: "new row violates row-level security policy for table 'rsvps'"

## Root Cause
The original RLS policies for anonymous RSVP submission were not working correctly. The policies had `with_check: "true"` but were still blocking inserts.

## Fix Applied

### RSVP Table Policy
```sql
-- Old policy (not working)
DROP POLICY IF EXISTS "Anyone can insert RSVP" ON rsvps;

-- New working policy
CREATE POLICY "Allow anonymous RSVP submission" ON rsvps
FOR INSERT TO public
WITH CHECK (true);
```

### Additional Guests Table Policy
```sql
-- Old policy (not working)  
DROP POLICY IF EXISTS "Anyone can insert additional guests" ON additional_guests;

-- New working policy
CREATE POLICY "Allow anonymous additional guest submission" ON additional_guests
FOR INSERT TO public
WITH CHECK (true);
```

## Result
- ✅ Anonymous users can now submit RSVPs successfully
- ✅ Additional guests can be added without authentication
- ✅ All other security policies remain intact
- ✅ Wedding owners still have protected access to view RSVPs
- ✅ RSVP submitters can still update their own submissions

## Testing
Both policies were tested with direct SQL inserts and confirmed working:
- RSVP insertion: ✅ Success
- Additional guest insertion: ✅ Success  
- Complete RSVP flow: ✅ Success

The RSVP submission form should now work without RLS policy violations.