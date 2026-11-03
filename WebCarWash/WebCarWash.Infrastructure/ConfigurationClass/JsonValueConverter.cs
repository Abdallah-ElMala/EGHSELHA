using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace WebCarWash.Infrastructure.ConfigrationClass
{
    public static class JsonValueConverter
    {
        public static ValueConverter<List<T>, string> Create<T>() =>
            new(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => string.IsNullOrEmpty(v) ? new List<T>() : JsonSerializer.Deserialize<List<T>>(v, (JsonSerializerOptions?)null) ?? new List<T>()
            );

        public static ValueComparer<List<T>> CreateComparer<T>() =>
            new(
                (c1, c2) => c1 != null && c2 != null ? c1.SequenceEqual(c2) : c1 == c2,
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v == null ? 0 : v.GetHashCode())),
                c => c.ToList()
            );
    }
}
