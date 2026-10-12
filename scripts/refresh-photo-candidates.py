#!/usr/bin/env python3
"""Collect public official-shop image candidates using the shared character keyword registry.
Produces a review file only; it never overwrites the published catalog or personal records.
"""
import argparse,concurrent.futures,json,re,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--pages',type=int,default=4);parser.add_argument('--output',default='photo-candidates.json');args=parser.parse_args()
 keywords=json.loads((ROOT/'lib/collection-keywords.json').read_text());known={p['remote_url'].split('?')[0] for p in json.loads((ROOT/'lib/catalog.json').read_text())}
 def page(n):
  url=f'https://chiikawamarket.jp/collections/all/products.json?limit=250&page={n}'
  with urllib.request.urlopen(url,timeout=20) as r:return json.load(r)['products']
 rows=[];seen=set()
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  for products in pool.map(page,range(1,max(1,min(args.pages,20))+1)):
   for p in products:
    title=p['title'];matches=[k for k in keywords if k['id']!='other' and k['japanese'] in title and (k['id']!='anoko' or re.search(r'あのこ(?!ろ)',title))]
    if not matches or not p.get('images'):continue
    # Specific names win over the generic 'Chiikawa' product prefix.
    k=max(matches,key=lambda k:(k['id']!='chiikawa',len(k['japanese'])))
    if k['id']=='chiikawa' and not any(v in title for v in ['（ちいかわ）','（ちいかわ ','「ちいかわ」']):k=next(x for x in keywords if x['id']=='friends')
    image=p['images'][0]['src'].split('?')[0]
    if image in seen or image in known:continue
    seen.add(image);rows.append({'character':k['id'],'name':k['name'],'title':title,'remote_url':image,'source':'https://chiikawamarket.jp/products/'+p['handle'],'source_kind':'치이카와 공식 마켓'})
 Path(args.output).write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n');print(f'{len(rows)} candidates across {len(set(r["character"] for r in rows))} character groups. Review before publishing.')
if __name__=='__main__':main()
