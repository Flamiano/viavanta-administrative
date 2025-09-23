import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rmjagsphikcdkscoyqfg.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtamFnc3BoaWtjZGtzY295cWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDYyODQsImV4cCI6MjA2NzgyMjI4NH0.OjV_pWMuxeX-EAxMkeZlByraIO6KUEVS2TVxT0d5Kqo"
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
   