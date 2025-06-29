import Sort from "@/components/Sort";
import { getFiles } from "@/lib/actions/file.action";


export default async function page({ params }: SearchParamProps ) {
  const type = ((await params)?.type as string) || "";
  const files = await getFiles();
  
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
            <h1 key={file.$id} className="h1">
              {file.name}
            </h1>
          ))}
        </section>
      ) : (
        <p className="empty">No files uploaded</p>
      )}
    </div>
  )
}
