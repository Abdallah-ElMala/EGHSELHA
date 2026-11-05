export const initialJobs = [
  { id:'#BK-0024', customer:'Ahmed Khaled', service:'Premium Wash', car:'Hyundai Elantra', address:'Cairo, Nasr City', time:'10:00 AM – 11:00 AM', date:'Today, Nov 03', distance:'3.2 km', price:350, status:'On The Way', phone:'+20 100 234 5678' },
  { id:'#BK-0025', customer:'Sara Mahmoud', service:'Deep Clean', car:'Kia Sportage', address:'Cairo, Heliopolis', time:'12:30 PM – 2:00 PM', date:'Today, Nov 03', distance:'5.1 km', price:500, status:'Upcoming', phone:'+20 111 456 7890' },
  { id:'#BK-0026', customer:'Omar Hassan', service:'Basic Wash', car:'Nissan Sunny', address:'Cairo, Maadi', time:'3:00 PM – 3:30 PM', date:'Today, Nov 03', distance:'7.4 km', price:200, status:'Upcoming', phone:'+20 122 789 1234' },
  { id:'#BK-0021', customer:'Mariam Adel', service:'Ultimate Detail', car:'BMW X5', address:'Cairo, New Cairo', time:'Yesterday, 1:00 PM', date:'Nov 02', distance:'4.0 km', price:700, status:'Completed', phone:'+20 109 333 2222' },
]

// الـ id فيه # فلازم نعمل encode عشان يشتغل في الـ URL
export const jobPath = (id) => `/technician/jobs/${encodeURIComponent(id)}`
