import { getTaskGroupShares } from "./get-task-group-shares.api";
import { SharedTaskGroupNavLinks } from "./shared-task-group-nav-links";

const navLinksLayoutClasses = "space-y-2 md:space-y-1";
const linkSizeClasses = "w-full px-4 py-1";

export async function SharedTaskGroupMenu() {
  const { taskGroupShares } = await getTaskGroupShares();

  return (
    <nav>
      <SharedTaskGroupNavLinks
        taskGroupShares={taskGroupShares}
        className={navLinksLayoutClasses}
        linkSizeClasses={linkSizeClasses}
      />
    </nav>
  );
}

const itemCount = 10;

export function LoadingSharedTaskGroupMenu() {
  return (
    <div className={navLinksLayoutClasses}>
      {Array.from({ length: itemCount }, (_, i) => i).map((itemIndex) => {
        const opacity = 1 - (itemIndex / itemCount) * 0.9;
        return (
          <div key={itemIndex} className={linkSizeClasses}>
            <span
              className="skeleton my-0.5 block h-5 w-full rounded-full"
              style={{ opacity }}
            />
          </div>
        );
      })}
    </div>
  );
}
