import Card from "@/components/Card";
import Sort from "@/components/Sort";
import { getFiles } from "@/lib/actions/file.action";
import { getFileTypesParams } from "@/lib/utils";



export default async function page({ searchParams, params }: SearchParamProps ) {
  const type = ((await params)?.type as string) || "";
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || ""; 
  const types = getFileTypesParams(type) as FileType[];
  const files = await getFiles({ types, searchText, sort });

  
  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">
          {type}
        </h1>
        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h5">0 MB</span>
          </p>
          <div className="sort-container">
            <p className="body-1 hidden sm:block">
              Sort by:
            </p>
            <Sort />
          </div>
        </div>
      </section>
      {files?.documents?.length > 0 ? (
        <section className="file-list">
          {files.documents.map((file) => (
            <Card key={file.$id} file={file}/>
          ))}
        </section>
      ) : (
        <p className="empty">No files uploaded</p>
      )}
    </div>
  )
}
