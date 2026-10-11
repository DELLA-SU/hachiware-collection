namespace Hachiware;
public sealed class Flight {
 public double X,Y,Vx,Vy,Elapsed; public bool Active; public int Bounces;
 public void Start(double x,double y,double vx,double vy){X=x;Y=y;var speed=Math.Sqrt(vx*vx+vy*vy);var scale=speed>0?Math.Clamp(speed,1000,2600)/speed:1;Vx=vx*scale;Vy=vy*scale;Elapsed=0;Bounces=0;Active=true;}
 public int Step(double dt,double left,double top,double right,double bottom){
  if(!Active)return 0;Elapsed+=dt;var before=Bounces;
  for(var i=0;i<2;i++){var step=dt/2;Vy+=1250*step;X+=Vx*step;Y+=Vy*step;
   if(X<left){X=left;Vx=Math.Abs(Vx);Bounces++;}else if(X>right){X=right;Vx=-Math.Abs(Vx);Bounces++;}
   if(Y<top){Y=top;Vy=Math.Max(500,Math.Abs(Vy)*.9);Bounces++;}else if(Y>bottom){Y=bottom;Vy=-Math.Max(950,Math.Abs(Vy)*.96);Bounces++;}
  }return Bounces-before;
 }
}
