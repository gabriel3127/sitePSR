import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Lazy initialization — o client só é criado na primeira vez que supabase é usado
// Evita que o bundle principal inicialize o Supabase desnecessariamente na home
let _client = null

export const supabase = new Proxy({}, {
  get(_, prop) {
    if (!_client) {
      _client = createClient(supabaseUrl, supabaseKey)
    }
    return _client[prop]
  }
})