import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProfiles() {
  const { data, error } = await supabase
    .from('student_profiles')
    .select('id, email, role, full_name')
  
  if (error) {
    console.error("Error reading profiles:", error)
  } else {
    console.log(JSON.stringify(data, null, 2))
  }
}

checkProfiles()
