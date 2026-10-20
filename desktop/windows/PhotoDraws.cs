using System.Globalization;
namespace Hachiware;
static class PhotoDraws {
 static readonly TimeZoneInfo Korea=TimeZoneInfo.FindSystemTimeZoneById("Korea Standard Time");
 public static string Day(DateTimeOffset now)=>TimeZoneInfo.ConvertTime(now,Korea).ToString("yyyy-MM-dd",CultureInfo.InvariantCulture);
 public static Photo[] Pool(Photo[] photos,Settings settings,DateTimeOffset now){
  var today=settings.DrawDay==Day(now)?settings.DrawnToday:[];
  var available=photos.Where(p=>p.draw_enabled!=false&&!today.Contains(p.id)).ToArray();
  var primary=new HashSet<string>{"hachiware","chiikawa","usagi","friends"};var mainTurn=settings.DrawCount%6<5;
  var preferred=available.Where(p=>primary.Contains(p.character??"friends")==mainTurn).ToArray();
  var candidates=preferred.Length>0?preferred:available;
  var fresh=candidates.Where(p=>!settings.Seen.Contains(p.id)).ToArray();return fresh.Length>0?fresh:candidates;
 }
 public static void Record(Settings settings,string id,DateTimeOffset now){var day=Day(now);if(settings.DrawDay!=day){settings.DrawDay=day;settings.DrawnToday.Clear();}if(!settings.DrawnToday.Contains(id))settings.DrawnToday.Add(id);if(!settings.Seen.Contains(id))settings.Seen.Add(id);settings.DrawCount++;}
}
