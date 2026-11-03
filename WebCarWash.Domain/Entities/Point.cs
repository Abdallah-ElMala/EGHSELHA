using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebCarWash.Domain.Entities
{
    public class Point
    {
        public float Latitude { get; set; }
        public float Longitude { get; set; }

        public Point()
        {
        }

        public Point(float latitude, float longitude)
        {
            Latitude = latitude;
            Longitude = longitude;
        }
    }
}
