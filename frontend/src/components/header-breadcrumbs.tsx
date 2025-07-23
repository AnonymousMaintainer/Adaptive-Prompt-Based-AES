import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface HeaderCrumbsProps {
  href?: string;
  page: string;
  slug_page?: string;
  slug?: string;
}

const HeaderCrumbs = ({ href, page, slug, slug_page }: HeaderCrumbsProps) => {
  return (
    <div className="w-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          {href && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={href}>{page}</BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          {slug && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`${href}${slug}`}>
                  {slug_page}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default HeaderCrumbs;
